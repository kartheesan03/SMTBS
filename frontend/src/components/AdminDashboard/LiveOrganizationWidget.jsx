import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { 
  Building2, Users, Briefcase, ShoppingCart, 
  HardHat, FileText, Target, Package, 
  CreditCard, ClipboardList, Activity
} from 'lucide-react';
import './LiveOrganizationWidget.css';

const ROLE_CONFIGS = {
  admin: {
    center: { id: 'company', label: 'COMPANY', icon: Building2 },
    satellites: [
      { id: 'sales', label: 'Sales', icon: ShoppingCart, angle: 0, tooltip: 'Sales · 4 active deals' },
      { id: 'projects', label: 'Projects', icon: HardHat, angle: 60, tooltip: 'Projects · 18 active · 3 at risk' },
      { id: 'hr', label: 'HR', icon: Users, angle: 120, tooltip: 'HR · 122 employees' },
      { id: 'materials', label: 'Materials', icon: Package, angle: 180, tooltip: 'Materials · 2 alerts' },
      { id: 'vendors', label: 'Vendors', icon: Briefcase, angle: 240, tooltip: 'Vendors · 8 pending POs' },
      { id: 'finance', label: 'Finance', icon: CreditCard, angle: 300, tooltip: 'Finance · 2 invoices due' },
    ],
    events: [
      { text: "New customer created", from: 'sales', to: 'company', color: '#10b981' },
      { text: "PO approved", from: 'finance', to: 'vendors', color: '#3b82f6' },
      { text: "Payment received", from: 'company', to: 'finance', color: '#8b5cf6' },
      { text: "Stock moved", from: 'materials', to: 'projects', color: '#f59e0b' },
      { text: "Project completed", from: 'projects', to: 'company', color: '#10b981' }
    ]
  },
  manager: {
    center: { id: 'projects', label: 'PROJECTS', icon: HardHat },
    satellites: [
      { id: 'team', label: 'Team', icon: Users, angle: 30, tooltip: 'Team · 14 members active' },
      { id: 'tasks', label: 'Tasks', icon: ClipboardList, angle: 102, tooltip: 'Tasks · 45 pending' },
      { id: 'materials', label: 'Materials', icon: Package, angle: 174, tooltip: 'Materials · Stock sufficient' },
      { id: 'vendors', label: 'Vendors', icon: Briefcase, angle: 246, tooltip: 'Vendors · 2 deliveries today' },
      { id: 'deadlines', label: 'Deadlines', icon: Target, angle: 318, tooltip: 'Deadlines · 1 due this week' },
    ],
    events: [
      { text: "Task completed", from: 'team', to: 'tasks', color: '#10b981' },
      { text: "Milestone updated", from: 'projects', to: 'team', color: '#3b82f6' },
      { text: "Material issued", from: 'materials', to: 'projects', color: '#f59e0b' },
      { text: "PO approved", from: 'vendors', to: 'projects', color: '#8b5cf6' }
    ]
  },
  hr: {
    center: { id: 'people', label: 'PEOPLE', icon: Users },
    satellites: [
      { id: 'attendance', label: 'Attendance', icon: Activity, angle: 45, tooltip: 'Attendance · 98% present' },
      { id: 'leave', label: 'Leave', icon: ClipboardList, angle: 135, tooltip: 'Leave · 3 pending requests' },
      { id: 'documents', label: 'Documents', icon: FileText, angle: 225, tooltip: 'Documents · 1 expiring' },
      { id: 'recruitment', label: 'Recruitment', icon: Target, angle: 315, tooltip: 'Recruitment · 2 open roles' },
    ],
    events: [
      { text: "Employee checked in", from: 'attendance', to: 'people', color: '#10b981' },
      { text: "Leave requested", from: 'people', to: 'leave', color: '#f59e0b' },
      { text: "Document updated", from: 'documents', to: 'people', color: '#3b82f6' },
      { text: "New candidate", from: 'recruitment', to: 'people', color: '#8b5cf6' }
    ]
  },
  employee: {
    center: { id: 'you', label: 'YOU', icon: Users },
    satellites: [
      { id: 'tasks', label: 'Tasks', icon: ClipboardList, angle: 72, tooltip: 'Tasks · 3 assigned today' },
      { id: 'project', label: 'Project', icon: HardHat, angle: 144, tooltip: 'Project · Phase 2 active' },
      { id: 'team', label: 'Team', icon: Users, angle: 216, tooltip: 'Team · 4 online' },
      { id: 'deadlines', label: 'Deadlines', icon: Target, angle: 288, tooltip: 'Deadlines · Tomorrow 5 PM' },
    ],
    events: [
      { text: "Task assigned", from: 'project', to: 'tasks', color: '#3b82f6' },
      { text: "Task completed", from: 'you', to: 'tasks', color: '#10b981' },
      { text: "Comment received", from: 'team', to: 'you', color: '#8b5cf6' },
      { text: "Deadline approaching", from: 'deadlines', to: 'you', color: '#ef4444' }
    ]
  },
  sales: {
    center: { id: 'revenue', label: 'REVENUE', icon: CreditCard },
    satellites: [
      { id: 'leads', label: 'Leads', icon: Users, angle: 72, tooltip: 'Leads · 12 new this week' },
      { id: 'prospects', label: 'Prospects', icon: Target, angle: 144, tooltip: 'Prospects · 5 active' },
      { id: 'deals', label: 'Deals', icon: Briefcase, angle: 216, tooltip: 'Deals · 3 in negotiation' },
      { id: 'customers', label: 'Customers', icon: Building2, angle: 288, tooltip: 'Customers · 45 total' },
    ],
    events: [
      { text: "New lead received", from: 'leads', to: 'prospects', color: '#3b82f6' },
      { text: "Deal negotiation", from: 'prospects', to: 'deals', color: '#f59e0b' },
      { text: "Payment received", from: 'customers', to: 'revenue', color: '#10b981' },
      { text: "Proposal viewed", from: 'deals', to: 'revenue', color: '#8b5cf6' }
    ]
  }
};

const LiveOrganizationWidget = () => {
  const { user } = useContext(AuthContext);
  const role = user?.role?.toLowerCase() || 'admin';
  const config = ROLE_CONFIGS[role] || ROLE_CONFIGS.admin;
  
  const [activeEvent, setActiveEvent] = useState(null);
  const [stream, setStream] = useState([]);
  const [totalEvents, setTotalEvents] = useState(24);

  // Helper to calculate node positions
  const getPos = (angle, radius) => {
    const rad = (angle - 90) * (Math.PI / 180);
    return {
      x: 50 + radius * Math.cos(rad),
      y: 50 + radius * Math.sin(rad)
    };
  };

  useEffect(() => {
    // Initial stream population
    const initialStream = [];
    for(let i=0; i<3; i++) {
      const randEv = config.events[Math.floor(Math.random() * config.events.length)];
      initialStream.push(randEv);
    }
    setStream(initialStream);

    // Random event generation loop
    const interval = setInterval(() => {
      const randEv = config.events[Math.floor(Math.random() * config.events.length)];
      
      setActiveEvent({
        ...randEv,
        id: Date.now()
      });
      
      setStream(prev => [randEv, ...prev].slice(0, 4));
      setTotalEvents(prev => prev + 1);
      
      // Clear active animation after 2.5s (matches CSS animation duration)
      setTimeout(() => {
        setActiveEvent(null);
      }, 2500);
      
    }, 4500);

    return () => clearInterval(interval);
  }, [role]);

  const CenterIcon = config.center.icon;

  return (
    <div className="bx-live-org-widget">
      {/* HEADER */}
      <div className="bx-live-org-header">
        <div className="bx-live-org-title">
          <Activity size={16} color="#3b82f6"/>
          Live Organization
        </div>
        <div className="bx-live-org-badge">
          <div className="bx-pulse-dot"></div>
          {totalEvents} active events
        </div>
      </div>

      {/* NETWORK BODY */}
      <div className="bx-live-org-body">
        
        {/* SVG Connections */}
        <svg className="bx-org-svg">
          {config.satellites.map((sat) => {
            const pos = getPos(sat.angle, 35);
            const isActive = activeEvent && (activeEvent.from === sat.id || activeEvent.to === sat.id);
            return (
              <line 
                key={`line-${sat.id}`}
                x1="50%" y1="50%" 
                x2={`${pos.x}%`} y2={`${pos.y}%`}
                className={`bx-org-path ${isActive ? 'active' : ''}`}
              />
            );
          })}
          
          {/* Traveling Dot Animation */}
          {activeEvent && (() => {
            let startPos = {x: 50, y: 50};
            let endPos = {x: 50, y: 50};
            
            const fromSat = config.satellites.find(s => s.id === activeEvent.from);
            const toSat = config.satellites.find(s => s.id === activeEvent.to);
            
            if (fromSat) startPos = getPos(fromSat.angle, 35);
            if (toSat) endPos = getPos(toSat.angle, 35);

            return (
              <path
                d={`M ${startPos.x}% ${startPos.y}% L ${endPos.x}% ${endPos.y}%`}
                stroke="none"
                fill="none"
                id="travelPath"
              />
            );
          })()}
        </svg>

        {/* Travel Dot SVG Element (using SVG animateMotion) */}
        {activeEvent && (
          <svg className="bx-org-svg" style={{zIndex: 5}}>
            {(() => {
               let startPos = {x: 50, y: 50};
               let endPos = {x: 50, y: 50};
               const fromSat = config.satellites.find(s => s.id === activeEvent.from);
               const toSat = config.satellites.find(s => s.id === activeEvent.to);
               if (fromSat) startPos = getPos(fromSat.angle, 35);
               if (toSat) endPos = getPos(toSat.angle, 35);
               return (
                 <circle r="4" fill={activeEvent.color} style={{filter: `drop-shadow(0 0 6px ${activeEvent.color})`}}>
                    <animateMotion dur="2.5s" repeatCount="1" fill="freeze">
                      <mpath href="#travelPath" />
                    </animateMotion>
                    <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.9;1" dur="2.5s" repeatCount="1" />
                 </circle>
               )
            })()}
          </svg>
        )}

        {/* Floating Event Label */}
        {activeEvent && (
          <div 
            className="bx-org-event-float" 
            style={{ 
              left: '50%', 
              top: '50%', 
              borderColor: activeEvent.color 
            }}
          >
            <span style={{color: activeEvent.color, marginRight:'6px'}}>●</span>
            {activeEvent.text}
          </div>
        )}

        {/* Central Node */}
        <div className="bx-org-node" style={{ left: '50%', top: '50%' }}>
          <div className="bx-org-tooltip">{config.center.label} · Core</div>
          <div className={`bx-org-node-circle center ${(activeEvent?.from === config.center.id || activeEvent?.to === config.center.id) ? 'pulsing' : ''}`}>
            <CenterIcon size={24} />
          </div>
          <div className="bx-org-node-label" style={{fontWeight: 700, color: '#1e293b'}}>{config.center.label}</div>
        </div>

        {/* Satellite Nodes */}
        {config.satellites.map((sat) => {
          const pos = getPos(sat.angle, 35);
          const SatIcon = sat.icon;
          const isPulsing = activeEvent?.from === sat.id || activeEvent?.to === sat.id;
          
          return (
            <div key={sat.id} className="bx-org-node" style={{ left: `${pos.x}%`, top: `${pos.y}%` }}>
              <div className="bx-org-tooltip">{sat.tooltip}</div>
              <div className={`bx-org-node-circle ${isPulsing ? 'pulsing' : ''}`}>
                <SatIcon size={18} />
              </div>
              <div className="bx-org-node-label">{sat.label}</div>
            </div>
          );
        })}

      </div>

      {/* FOOTER EVENT STREAM */}
      <div className="bx-live-org-footer">
        <div className="bx-event-stream">
          {stream.map((ev, i) => (
            <div key={i + (ev.id || i)} className="bx-stream-item">
              <div className="bx-stream-dot" style={{backgroundColor: ev.color}}></div>
              {ev.text}
            </div>
          ))}
        </div>
        <a href="#" className="bx-view-live-btn" onClick={(e) => e.preventDefault()}>
          View Live &rarr;
        </a>
      </div>
    </div>
  );
};

export default LiveOrganizationWidget;
