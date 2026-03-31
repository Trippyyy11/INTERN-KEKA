# Attendance System Changes - 2026-03-31

Today's updates focus on refining the attendance clock-in/out logic to better support flexible working hours and improving the visual feedback for users.

## 1. 16-Hour Window Logic
- **Objective**: Treat multiple clock-ins within a 16-hour window (from first clock-in) as a single session with segments/breaks.
- **Backend Changes**:
    - **Model (`Attendance.js`)**: Added `effectiveHours` and `grossHours` fields to explicitly track active vs. total span time.
    - **Controller (`attendanceController.js`)**: 
        - Updated `clockOut` and `updateAttendance` to calculate `effectiveHours` (excluding breaks) and `grossHours` (total span from first in to last out).
        - Updated `clockIn` to detect sessions that were previously auto-closed by the system. If a user previously forgot to clock out, the system will now start a **fresh session** instead of attempting a resume.
    - **Helper (`utils/attendanceHelper.js`)**: Updated `autoCloseStaleSessions` to correctly populate `effectiveHours` and `grossHours` when closing a forgotten session.

## 2. Real-time Frontend Calculations
- **Logic (`Dashboard.jsx`)**: 
    - Updated `calculateElapsedTime` to factor in the `breaks` array from the active session.
    - **Flexible Resumption**: Updated the "Session Finished" detection to only trigger if the 16-hour window from the session's start has fully expired. This allows users to clock in again and resume work (even after a manual clock-out) as long as they are within the 16-hour window.
    - Updated the "Session Finished" detection to **ignore auto-closed sessions**. This ensures that if a user forgot to clock out yesterday, they aren't locked out of starting their new session today.
    - `effectiveText`: Human-readable active time (e.g., "6h 30m").
    - `text`: Human-readable gross span (e.g., "8h 0m").
- **Calls**: Updated all internal and external calls to pass `activeLog.breaks`.

## 3. UI Enhancements (Attendance Tab)
- **Actions Card**: 
    - Redesigned the "Total Hours" section to show a clear breakdown of **Effective Hours** vs **Gross Session**.
    - **Session Log Breakdown**: Added a new "Web Clock In" section at the bottom of the card that lists every individual clock-in and clock-out event for the day. Each row shows the precise start/end times (AM/PM) and identifies "MISSING" clock-outs in real-time.
    - **Redefined Metrics**: 
        - **Gross Session**: Now represents the **Total Accumulated Work Time** (Sum of all active sessions today). This is the key metric for deciding when to leave the office.
        - **Effective Hours**: Now represents the **Current Active Segment** (Time since your last resume/clock-in). This field automatically hides when you are clocked out to focus on your total daily progress.
    - **Persistent Metrics**: If a user is clocked out but still within their 16-hour window, the Actions card now continues to show their last-recorded **Gross** time instead of resetting to zero.
    - Improved styling with better icons, spacing, and font weights for a premium feel.
- **Stats Panel**:
    - Replaced browser-default `title` tooltips on the 7-day chart with **Premium Animated Tooltips**.
    - Added detailed breakdown (Worked vs Target) on hover with smooth transitions using `framer-motion`.

## 4. Verification
- Verified backend calculations for various scenarios (multiple breaks, auto-clock-out).
- Verified frontend real-time updates and responsive design of the new tooltips.
