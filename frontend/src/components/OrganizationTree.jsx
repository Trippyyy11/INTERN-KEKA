import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    applyNodeChanges,
    applyEdgeChanges,
    addEdge,
    Panel,
    MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import api from '../api/axios';
import dagre from 'dagre';
import CustomNode from './ui/CustomNode';

const nodeWidth = 220;
const nodeHeight = 100;

const nodeTypes = {
    custom: CustomNode,
};

const getLayoutedElements = (nodes, edges, direction = 'TB') => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({ rankdir: direction, nodesep: 100, ranksep: 100 });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    nodes.forEach((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        node.targetPosition = direction === 'TB' ? 'top' : 'left';
        node.sourcePosition = direction === 'TB' ? 'bottom' : 'right';
        node.position = {
            x: nodeWithPosition.x - nodeWidth / 2,
            y: nodeWithPosition.y - nodeHeight / 2,
        };
        return node;
    });

    return { nodes, edges };
};

const ContextMenu = ({ x, y, node, onClose, onAction, allUsers, canEdit }) => {
    if (!canEdit) return null;

    const roleWeights = { 'Super Admin': 3, 'Reporting Officer': 2, 'Intern': 1 };
    const nodeWeight = roleWeights[node.data.role] || 0;

    // Users who can report TO this node — employees can't have subordinates
    const possibleSubordinates = nodeWeight <= 1 ? [] : allUsers.filter(u => {
        if (u._id === node.id) return false; // Can't report to self
        const uWeight = roleWeights[u.role] || 0;
        return uWeight < nodeWeight; // Strictly less than, so employees can't manage employees
    });

    return (
        <div style={{
            position: 'fixed',
            top: y,
            left: x,
            zIndex: 1000,
            background: 'rgba(23, 23, 33, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '8px',
            minWidth: '200px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
        }}>
            <div style={{ padding: '8px 12px', fontSize: '0.7rem', color: 'var(--text-muted)', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '4px' }}>
                ACTIONS FOR {node.data.name.toUpperCase()}
            </div>

            <div className="menu-group">
                <div style={{ padding: '8px 12px', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--primary)' }}>Assign Subordinate</div>
                <div style={{ maxHeight: '150px', overflowY: 'auto', marginBottom: '8px' }}>
                    {possibleSubordinates.length > 0 ? possibleSubordinates.map(user => (
                        <button key={user._id} onClick={() => onAction('assign', node.id, user)} className="menu-item-btn">
                            + {user.name} ({user.role})
                        </button>
                    )) : <div style={{ padding: '8px 12px', fontSize: '0.7rem', color: 'gray' }}>No valid subordinates</div>}
                </div>
            </div>

            {node.data.reportingManager && (
                <button onClick={() => onAction('remove', node.id)} className="menu-item-btn danger">
                    Break Reporting Connection
                </button>
            )}

            <button onClick={onClose} className="menu-item-btn secondary">Cancel</button>

            <style>{`
                .menu-item-btn {
                    width: 100%;
                    text-align: left;
                    padding: 8px 12px;
                    background: transparent;
                    border: none;
                    color: #fff;
                    font-size: 0.8rem;
                    cursor: pointer;
                    border-radius: 8px;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                }
                .menu-item-btn:hover { background: rgba(255,255,255,0.05); }
                .menu-item-btn.danger { color: #ff4757; border-top: 1px solid rgba(255,255,255,0.05); margin-top: 4px; padding-top: 12px; }
                .menu-item-btn.danger:hover { background: rgba(255, 71, 87, 0.1); }
                .menu-item-btn.secondary { color: #888; border-top: 1px solid rgba(255,255,255,0.05); margin-top: 4px; }
            `}</style>
        </div>
    );
};

export default function OrganizationTree({ user: currentUser, isLightMode }) {
    const [users, setUsers] = useState([]);
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [unassignedUsers, setUnassignedUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [menu, setMenu] = useState(null);
    const reactFlowWrapper = useRef(null);

    const canEdit = currentUser?.role === 'Reporting Officer' || currentUser?.role === 'Super Admin';
    const roleWeights = { 'Super Admin': 3, 'Reporting Officer': 2, 'Intern': 1 };

    const fetchUsers = async () => {
        try {
            const res = await api.get('/admin/org-users');
            setUsers(res.data);
            processHierarchy(res.data);
        } catch (error) { console.error('Error fetching users:', error); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchUsers(); }, []);

    // Also re-process hierarchy when theme changes to update node data
    useEffect(() => {
        if (users.length > 0) processHierarchy(users);
    }, [isLightMode]);

    const processHierarchy = (allUsers) => {
        const initialNodes = [];
        const initialEdges = [];
        const unassigned = [];

        allUsers.forEach((user) => {
            if (!user.reportingManager) {
                unassigned.push(user);
            }

            initialNodes.push({
                id: user._id,
                type: 'custom',
                data: { ...user, isLightMode }, // Pass theme to custom node
                position: { x: 0, y: 0 }
            });

            if (user.reportingManager) {
                const managerId = typeof user.reportingManager === 'object' ? user.reportingManager._id : user.reportingManager;
                const manager = allUsers.find(u => u._id === managerId);
                const isManagerEntry = manager && (manager.role === 'Reporting Officer' || manager.role === 'Super Admin');

                initialEdges.push({
                    id: `e-${managerId}-${user._id}`,
                    source: managerId,
                    target: user._id,
                    type: 'smoothstep',
                    animated: true,
                    style: { 
                        stroke: isManagerEntry ? '#ffab00' : '#00ffa2', 
                        strokeWidth: 2, 
                        opacity: isLightMode ? 0.8 : 0.6 
                    },
                    markerEnd: { 
                        type: MarkerType.ArrowClosed, 
                        color: isManagerEntry ? '#ffab00' : '#00ffa2' 
                    }
                });
            }
        });

        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(initialNodes, initialEdges);
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
        setUnassignedUsers(unassigned);
    };

    const onNodesChange = useCallback((changes) => {
        if (!canEdit) return;
        setNodes((nds) => applyNodeChanges(changes, nds));
    }, [canEdit]);

    const onEdgesChange = useCallback((changes) => {
        if (!canEdit) return;
        setEdges((eds) => applyEdgeChanges(changes, eds));
    }, [canEdit]);

    const createsLoop = (source, target, edges) => {
        let current = source;
        while (current) {
            if (current === target) return true;
            const parentEdge = edges.find(e => e.target === current);
            if (!parentEdge) break;
            current = parentEdge.source;
        }
        return false;
    };

    const onConnect = useCallback(async (params) => {
        if (!canEdit) return;

        if (params.source === params.target) {
            alert("User cannot report to themselves.");
            return;
        }

        const sourceUser = users.find(u => u._id === params.source);
        const targetUser = users.find(u => u._id === params.target);

        // Role hierarchy validation
        const sourceWeight = roleWeights[sourceUser?.role] || 0;
        const targetWeight = roleWeights[targetUser?.role] || 0;

        if (targetWeight > sourceWeight) {
            alert(`A ${targetUser.role} cannot report to a ${sourceUser.role}.`);
            return;
        }

        if (createsLoop(params.source, params.target, edges)) {
            alert("This connection would create a reporting loop.");
            return;
        }

        try {
            await api.put(`/admin/users/${params.target}/manager`, {
                managerId: params.source
            });
            setTimeout(fetchUsers, 500);
        } catch (error) {
            alert("Failed to assign manager: " + error.response?.data?.message);
        }
    }, [edges, users, canEdit]);

    const onNodeContextMenu = useCallback((event, node) => {
        if (!canEdit) return;
        event.preventDefault();
        setMenu({ id: node.id, top: event.clientY, left: event.clientX, node });
    }, [canEdit]);

    const onPaneClick = useCallback(() => setMenu(null), []);

    const handleMenuAction = async (type, nodeId, data) => {
        try {
            if (type === 'assign') {
                const sourceUser = users.find(u => u._id === nodeId);
                const targetUser = data;
                const sourceWeight = roleWeights[sourceUser?.role] || 0;
                const targetWeight = roleWeights[targetUser?.role] || 0;

                if (targetWeight > sourceWeight) {
                    alert(`A ${targetUser.role} cannot report to a ${sourceUser.role}.`);
                    return;
                }

                await api.put(`/admin/users/${data._id}/manager`, { managerId: nodeId });
            } else if (type === 'remove') {
                await api.put(`/admin/users/${nodeId}/manager`, { managerId: null });
            }
            setMenu(null);
            fetchUsers();
        } catch (error) { alert("Action failed: " + error.response?.data?.message); }
    };

    const onLayout = useCallback(() => {
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges);
        setNodes([...layoutedNodes]);
        setEdges([...layoutedEdges]);
    }, [nodes, edges]);

    if (loading) return <div style={{ padding: '2rem', color: 'var(--text-main)' }}>Loading...</div>;

    return (
        <div style={{ display: 'flex', height: '100%', width: '100%', gap: '1rem' }} ref={reactFlowWrapper}>
            <div style={{ 
                width: '280px', 
                background: isLightMode ? 'rgba(255,255,255,0.7)' : 'rgba(15, 23, 42, 0.5)',
                backdropFilter: 'blur(16px)',
                padding: '1.5rem', 
                borderRadius: '24px', 
                border: `1px solid ${isLightMode ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.05)'}`, 
                display: 'flex', flexDirection: 'column' 
            }}>
                <h3 style={{ color: 'var(--text-main)', marginBottom: '0.5rem', fontSize: '1.1rem', fontWeight: '800' }}>Directory</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                    {canEdit ? "All users are shown on the tree. Use the right-click menu or drag between nodes to manage reporting." : "Overview of the organization structure."}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', overflowY: 'auto', flex: 1 }}>
                    {unassignedUsers.map((u) => (
                        <div key={u._id}
                            style={{ 
                                padding: '1rem', 
                                background: isLightMode ? '#fff' : 'rgba(255,255,255,0.03)', 
                                border: `1px solid ${isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.05)'}`, 
                                borderRadius: '12px', color: 'var(--text-main)',
                                boxShadow: isLightMode ? '0 2px 8px rgba(0,0,0,0.02)' : 'none'
                            }}>
                            <div style={{ fontWeight: '700', fontSize: '0.85rem' }}>{u.name}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>{u.designation || u.role}</div>
                            <div style={{ fontSize: '0.6rem', color: 'var(--primary)', marginTop: '4px', fontWeight: 'bold' }}>UNASSIGNED</div>
                        </div>
                    ))}
                    {unassignedUsers.length === 0 && <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', marginTop: '2rem' }}>All members assigned.</div>}
                </div>
            </div>

            <div style={{ 
                flex: 1, 
                background: isLightMode ? '#f8fafc' : '#0a0e17', 
                borderRadius: '24px', 
                overflow: 'hidden', 
                border: `1px solid ${isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.05)'}`, 
                position: 'relative' 
            }}>
                <ReactFlow
                    nodes={nodes} edges={edges}
                    onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
                    onConnect={onConnect} nodeTypes={nodeTypes}
                    onNodeContextMenu={onNodeContextMenu} onPaneClick={onPaneClick}
                    fitView colorMode={isLightMode ? 'light' : 'dark'}
                    nodesDraggable={canEdit}
                    elementsSelectable={canEdit}
                    panOnDrag={true}
                >
                    <Background 
                        variant="lines" gap={50} size={1} 
                        color={isLightMode ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.02)"} 
                    />
                    <Controls style={{ 
                        background: isLightMode ? '#fff' : 'var(--bg-panel)', 
                        border: `1px solid ${isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.05)'}`, 
                        borderRadius: '8px',
                        color: 'var(--text-main)'
                    }} />
                    <Panel position="top-right">
                        <button className="btn btn-primary" onClick={onLayout} style={{ borderRadius: '12px', padding: '0.6rem 1.2rem', fontWeight: '700', boxShadow: '0 4px 12px rgba(var(--primary-rgb), 0.3)' }}>Auto Arrange</button>
                    </Panel>
                </ReactFlow>
                {menu && <ContextMenu x={menu.left} y={menu.top} node={menu.node} onClose={onPaneClick} onAction={handleMenuAction} allUsers={users} canEdit={canEdit} />}
            </div>
        </div>
    );
}
