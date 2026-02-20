"use client";

import React from 'react';

const GizmoOverlay = ({ step }) => {
    if (!step.active) return null;
    const id = step.typeDef.id;
    const p = step.params;
    const scale = step.universal.scale !== undefined ? step.universal.scale : 1.0;
    const offX = step.universal.offsetX || 0.0;
    const offY = step.universal.offsetY || 0.0;
    const centerX = 50 + (offX * scale * 100);
    const centerY = 50 - (offY * scale * 100);
    let gizmo = null;

    if (id === 1) {
        const type = p.p1;
        const size = p.p2 * scale;
        if (type == 0 || type == 3) {
            const r = size * 50;
            gizmo = <circle cx={centerX} cy={centerY} r={r} fill="none" stroke="rgba(255, 255, 0, 0.7)" strokeWidth="1" strokeDasharray="4 2" />;
        } else if (type == 1 || type == 4) {
            const w = size * 100;
            const x = centerX - w / 2;
            const y = centerY - w / 2;
            gizmo = <rect x={x} y={y} width={w} height={w} fill="none" stroke="rgba(255, 255, 0, 0.7)" strokeWidth="1" strokeDasharray="4 2" />;
        } else if (type == 2 || type == 5) {
            const r = size * 50;
            const yOffset = r * 0.25;
            const p1x = centerX;
            const p1y = centerY - r + yOffset;
            const p2x = centerX + r * 0.866;
            const p2y = centerY + r * 0.5 + yOffset;
            const p3x = centerX - r * 0.866;
            const p3y = centerY + r * 0.5 + yOffset;
            gizmo = <polygon points={`${p1x},${p1y} ${p2x},${p2y} ${p3x},${p3y}`} fill="none" stroke="rgba(255, 255, 0, 0.7)" strokeWidth="1" strokeDasharray="4 2" />;
        }
    } else if (id === 14) {
        const isSquare = p.p1 >= 0.5;
        const size = p.p2 * scale;
        const gizmoSize = size * 100;
        if (isSquare) {
            const w = gizmoSize * 2;
            const x = centerX - gizmoSize;
            const y = centerY - gizmoSize;
            gizmo = <rect x={x} y={y} width={w} height={w} fill="none" stroke="rgba(0, 255, 255, 0.8)" strokeWidth="1.5" />;
        } else {
            gizmo = <circle cx={centerX} cy={centerY} r={gizmoSize} fill="none" stroke="rgba(0, 255, 255, 0.8)" strokeWidth="1.5" />;
        }
    } else if (id === 13) {
        const cxRaw = p.p4;
        const cyRaw = p.p5;
        const cx = ((cxRaw - 0.5 + offX) * scale + 0.5) * 100;
        const cy_GL = ((cyRaw - 0.5 + offY) * scale + 0.5);
        const cy = (1.0 - cy_GL) * 100;
        gizmo = (<g stroke="rgba(255, 0, 255, 0.8)" strokeWidth="1"> <line x1={cx - 10} y1={cy} x2={cx + 10} y2={cy} /> <line x1={cx} y1={cy - 10} x2={cx} y2={cy + 10} /> <circle cx={cx} cy={cy} r="3" fill="none" /> </g>);
    } else if (id === 12) {
        const segments = p.p1;
        const lines = [];
        for (let i = 0; i < segments; i++) {
            const angle = (Math.PI * 2 / segments) * i;
            const x2 = centerX + Math.cos(angle) * 70 * scale;
            const y2 = centerY + Math.sin(angle) * 70 * scale;
            lines.push(<line key={i} x1={centerX} y1={centerY} x2={x2} y2={y2} stroke="rgba(100, 255, 100, 0.5)" strokeWidth="0.5" />);
        }
        gizmo = <g>{lines}</g>;
    }
    return <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 100 100" preserveAspectRatio="none">{gizmo}</svg>;
};

export default GizmoOverlay;
