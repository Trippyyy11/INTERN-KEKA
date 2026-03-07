import React, { useState, useEffect, useCallback, useMemo } from 'react';
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

const nodeWidth = 200;
const nodeHeight = 80;

const getLayoutedElements = (nodes, edges, direction = 'TB') => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    dagreGraph.setGraph({ rankdir: direction });

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

        // We are shifting the dagre node position (anchor=center center) to the top left
        // so it matches the React Flow node anchor point (top left).
        node.position = {
            x: nodeWithPosition.x - nodeWidth / 2,
            y: nodeWithPosition.y - nodeHeight / 2,
        };

        return node;
    });

    return { nodes, edges };
};

export default function OrganizationTree() {
    const [users, setUsers] = useState([]);
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [unassignedUsers, setUnassignedUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/admin/users');
            const data = res.data;
            setUsers(data);
            processHierarchy(data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const processHierarchy = (allUsers) => {
        const initialNodes = [];
        const initialEdges = [];
        const unassigned = [];

        // Distinguish Admins from Interns/Employees
        const admins = allUsers.filter(u => u.role === 'Admin' || u.role === 'Super Admin');
        // Note: For this feature, users who are not Admins are considered reportees.
        // Even an admin could report to a Super Admin, but usually Admins are roots.

        allUsers.forEach((user) => {
            const isManager = admins.some(a => a._id === user._id);
            const bgColor = isManager ? '#ffab00' : '#00ffa2';

            // If they have no reporting manager and aren't an admin, put in unassigned list
            if (!user.reportingManager && !isManager) {
                unassigned.push(user);
                return; // Don't add to nodes yet
            }

            initialNodes.push({
                id: user._id,
                data: { label: `${user.name}\n(${user.designation || user.role})` },
                style: {
                    background: bgColor,
                    color: 'white',
                    border: '1px solid #1f2937',
                    borderRadius: '8px',
                    width: nodeWidth,
                    textAlign: 'center',
                    padding: '10px'
                },
                position: { x: 0, y: 0 } // handled by dagre
            });

            if (user.reportingManager) {
                // The API might populate it or just send an ID. Check if it's an object.
                const managerId = typeof user.reportingManager === 'object' ? user.reportingManager._id : user.reportingManager;
                initialEdges.push({
                    id: `e-${managerId}-${user._id}`,
                    source: managerId,
                    target: user._id,
                    type: 'smoothstep',
                    animated: true,
                    markerEnd: {
                        type: MarkerType.ArrowClosed,
                        color: 'var(--text-muted)'
                    },
                    style: { stroke: 'var(--text-muted)' }
                });
            }
        });

        // Add dummy nodes for Admins if they aren't part of any edge to ensure they appear
        admins.forEach(admin => {
            if (!initialNodes.some(n => n.id === admin._id)) {
                initialNodes.push({
                    id: admin._id,
                    data: { label: `${admin.name}\n(${admin.designation || admin.role})` },
                    style: {
                        background: '#ffab00',
                        color: 'white',
                        border: '1px solid #1f2937',
                        borderRadius: '8px',
                        width: nodeWidth,
                        textAlign: 'center',
                        padding: '10px'
                    },
                    position: { x: 0, y: 0 }
                });
            }
        });

        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(initialNodes, initialEdges);

        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
        setUnassignedUsers(unassigned);
    };

    const onNodesChange = useCallback(
        (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
        []
    );
    const onEdgesChange = useCallback(
        (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        []
    );

    const onConnect = useCallback(
        async (params) => {
            const { source, target } = params;
            // Prevent self-connection or reverse hierarchy simply by checking
            if (source === target) return;

            // Update Backend
            try {
                await api.put(`/admin/users/${target}/manager`, { managerId: source });
                setEdges((eds) => addEdge({ ...params, type: 'smoothstep', animated: true, markerEnd: { type: MarkerType.ArrowClosed } }, eds));
                // Optional: Re-fetch or re-layout
                setTimeout(() => fetchUsers(), 500);
            } catch (error) {
                console.error("Failed to assign manager", error);
                alert("Failed to assign manager: " + (error.response?.data?.message || 'Unknown error'));
            }
        },
        [setEdges]
    );

    const onDragStart = (event, user) => {
        event.dataTransfer.setData('application/reactflow', JSON.stringify(user));
        event.dataTransfer.effectAllowed = 'move';
    };

    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event) => {
            event.preventDefault();

            const userDataStr = event.dataTransfer.getData('application/reactflow');
            if (!userDataStr) return;

            const droppedUser = JSON.parse(userDataStr);

            // Add node to flow at approximately drop position
            const reactFlowBounds = document.querySelector('.react-flow').getBoundingClientRect();
            // Note: If using strict react flow projection we'd use project() from useReactFlow,
            // but for simplicity we rely on manual connection afterward or auto-layout.

            const newNode = {
                id: droppedUser._id,
                position: {
                    x: event.clientX - reactFlowBounds.left,
                    y: event.clientY - reactFlowBounds.top,
                },
                data: { label: `${droppedUser.name}\n(${droppedUser.designation || droppedUser.role})` },
                style: {
                    background: '#00ffa2',
                    color: 'white',
                    border: '1px solid #1f2937',
                    borderRadius: '8px',
                    width: nodeWidth,
                    textAlign: 'center',
                    padding: '10px'
                }
            };

            setNodes((nds) => nds.concat(newNode));
            setUnassignedUsers((unassigned) => unassigned.filter(u => u._id !== droppedUser._id));
        },
        [setNodes, setUnassignedUsers]
    );

    // Re-layout button
    const onLayout = useCallback(() => {
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges);
        setNodes([...layoutedNodes]);
        setEdges([...layoutedEdges]);
    }, [nodes, edges]);


    if (loading) return <div style={{ padding: '2rem', color: 'var(--text-main)' }}>Loading Organization Tree...</div>;

    return (
        <div style={{ display: 'flex', height: '100%', width: '100%', gap: '1rem' }}>
            {/* Sidebar for Unassigned Users */}
            <div style={{ width: '250px', background: 'var(--bg-panel)', padding: '1rem', borderRadius: 'var(--radius-lg)', overflowY: 'auto' }}>
                <h3 style={{ color: 'var(--text-main)', marginBottom: '1rem', fontSize: '1rem', fontWeight: 'bold' }}>Unassigned Interns</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    Drag these users onto the canvas, then connect them to an Admin (Manager).
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {unassignedUsers.map((u) => (
                        <div
                            key={u._id}
                            onDragStart={(event) => onDragStart(event, u)}
                            draggable
                            style={{
                                padding: '0.8rem',
                                background: 'var(--bg-dark)',
                                border: '1px solid var(--border-dark)',
                                borderRadius: '4px',
                                cursor: 'grab',
                                color: 'var(--text-main)',
                                fontSize: '0.85rem'
                            }}
                        >
                            <strong>{u.name}</strong><br />
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.designation || 'Intern'}</span>
                        </div>
                    ))}
                    {unassignedUsers.length === 0 && (
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No unassigned interns.</div>
                    )}
                </div>
            </div>

            {/* React Flow Canvas */}
            <div style={{ flex: 1, border: '1px solid var(--border-dark)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    fitView
                    colorMode="dark"
                >
                    <Controls />
                    <MiniMap
                        nodeStrokeColor={(n) => {
                            if (n.style?.background === '#ffab00') return '#ffab00';
                            return '#00ffa2';
                        }}
                        nodeColor={(n) => {
                            if (n.style?.background === '#ffab00') return '#ffab00';
                            return '#00ffa2';
                        }}
                        nodeBorderRadius={2}
                    />
                    <Background variant="dots" gap={12} size={1} color="var(--text-muted)" />
                    <Panel position="top-right">
                        <button className="btn btn-primary" onClick={onLayout}>Auto Layout</button>
                    </Panel>
                </ReactFlow>
            </div>
        </div>
    );
}
