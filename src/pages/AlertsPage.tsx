import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BellRing,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  Send,
  MessageSquare,
  Mail,
  Smartphone,
  ChevronRight,
  ShieldAlert,
  ArrowUpRight,
  Check,
  Snooze,
  Filter,
  Settings
} from 'lucide-react';
import { useAlerts } from '../context/AlertsContext';
import { useAuth } from '../context/AuthContext';
import { AlertItem } from '../types';

export const AlertsPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isAdmin = user?.role !== 'Institution User';
  const { alerts, acknowledgeAlert, snoozeAlert } = useAlerts();

  const [activeTab, setActiveTab] = useState<'alerts' | 'escalation' | 'calendar' | 'channels'>('alerts');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [actionMsg, setActionMsg] = useState('');

  // Channel settings state
  const [channelSettings, setChannelSettings] = useState({
    inApp: true,
    email: true,
    sms: true,
    whatsapp: true,
    escalationHours: 24
  });

  // Simulated delivery log
  const [deliveryLogs] = useState([
    { id: 'LOG-01', channel: 'SMS (NIC Gateway)', recipient: '+91 98765 43210', status: 'Delivered', time: '10 mins ago', message: 'Statutory Fire NOC expiry alert sent to SPCE Principal.' },
    { id: 'LOG-02', channel: 'WhatsApp Cloud API', recipient: '+91 98765 43210', status: 'Read', time: '9 mins ago', message: 'Ghost Faculty Collision detected for Dr. Ramesh Verma.' },
    { id: 'LOG-03', channel: 'Gov Email (nic.in)', recipient: 'principal@spce.ac.in', status: 'Delivered', time: '28 mins ago', message: 'Official deficiency rectification notice dispatched.' },
    { id: 'LOG-04', channel: 'In-App Statutory Push', recipient: 'Regional Officer Western', status: 'Rendered', time: '1 hour ago', message: 'SLA countdown alert: 2 days remaining.' }
  ]);

  const handleAcknowledge = async (id: string) => {
    await acknowledgeAlert(id);
    setActionMsg(`Alert #${id} marked as Acknowledged.`);
    setTimeout(() => setActionMsg(''), 3000);
  };

  const handleSnooze = async (id: string) => {
    await snoozeAlert(id, 3);
    setActionMsg(`Alert #${id} snoozed for 3 statutory days.`);
    setTimeout(() => setActionMsg(''), 3000);
  };

  const filteredAlerts = alerts.filter(a => {
    if (!isAdmin && user?.institutionId && a.institutionId !== user.institutionId) {
      return false;
    }
    const matchesPriority = priorityFilter === 'All' || a.priority === priorityFilter;
    const matchesStatus = statusFilter === 'All' || a.status === statusFilter;
    return matchesPriority && matchesStatus;
  });

  // Calendar dates
  const rawCalendarEvents = [
    { date: '2026-10-30', title: 'Surprise On-Site Physical Inspection', college: 'Apex Global Institute', type: 'Critical', daysLeft: 3 },
    { date: '2026-10-31', title: 'Deficiency Clarification Window Closes', college: 'Sardar Patel College of Engg', type: 'Critical', daysLeft: 4 },
    { date: '2026-11-05', title: 'Mandatory Website Disclosure Audit Deadline', college: 'All Technical Institutes', type: 'High', daysLeft: 9 },
    { date: '2026-11-14', title: 'Fire Safety Certificate Hard Expiry', college: 'SPCE Mumbai Block B', type: 'Critical', daysLeft: 18 },
    { date: '2026-11-20', title: 'Cadre Ratio Rectification Compliance', college: 'Govt College Salem', type: 'Medium', daysLeft: 24 }
  ];

  const calendarEvents = isAdmin
    ? rawCalendarEvents
    : rawCalendarEvents.filter(
        e =>
          e.college === 'All Technical Institutes' ||
          (user?.institutionName && e.college.toLowerCase().includes(user.institutionName.toLowerCase().slice(0, 10)))
      );

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-aicte-100 text-aicte-800 dark:bg-aicte-950 dark:text-saffron-300">
              Module 4: Alert Engine & Escalation Matrix
            </span>
            <span className="text-xs text-slate-400">Proactive Multi-Channel Notifications</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            Statutory Alerts, Reminders & Escalation Matrix
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Threshold-triggered statutory countdowns, visual supervisor escalation chains, and multi-channel delivery.
          </p>
        </div>

        {actionMsg && (
          <div className="px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 text-emerald-800 dark:text-emerald-300 text-xs font-semibold animate-in fade-in">
            {actionMsg}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('alerts')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition whitespace-nowrap ${
            activeTab === 'alerts'
              ? 'border-aicte-600 text-aicte-600 dark:text-saffron-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <BellRing className="w-4 h-4" />
          <span>Active Alert Center ({alerts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('escalation')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition whitespace-nowrap ${
            activeTab === 'escalation'
              ? 'border-aicte-600 text-aicte-600 dark:text-saffron-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-red-500" />
          <span>Visual Escalation Matrix</span>
        </button>

        <button
          onClick={() => setActiveTab('calendar')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition whitespace-nowrap ${
            activeTab === 'calendar'
              ? 'border-aicte-600 text-aicte-600 dark:text-saffron-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4 text-amber-500" />
          <span>Deadlines Calendar View</span>
        </button>

        <button
          onClick={() => setActiveTab('channels')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition whitespace-nowrap ${
            activeTab === 'channels'
              ? 'border-aicte-600 text-aicte-600 dark:text-saffron-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Channel Settings & Delivery Logs</span>
        </button>
      </div>

      {/* --- TAB 1: ALERTS LIST --- */}
      {activeTab === 'alerts' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-gov text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-500">Filter Priority:</span>
              {['All', 'Critical', 'High', 'Medium'].map(p => (
                <button
                  key={p}
                  onClick={() => setPriorityFilter(p)}
                  className={`px-3 py-1 rounded-lg transition ${
                    priorityFilter === p
                      ? 'bg-aicte-600 text-white font-bold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-500">Status:</span>
              {['All', 'New', 'Acknowledged', 'Escalated'].map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1 rounded-lg transition ${
                    statusFilter === s
                      ? 'bg-aicte-600 text-white font-bold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Alerts Grid */}
          <div className="space-y-4">
            {filteredAlerts.map(alert => (
              <div
                key={alert.id}
                className={`p-5 rounded-3xl bg-white dark:bg-slate-900 border shadow-gov transition space-y-3 ${
                  alert.priority === 'Critical'
                    ? 'border-red-200 dark:border-red-900/50 hover:border-red-400'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        alert.priority === 'Critical'
                          ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                          : alert.priority === 'High'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                      }`}
                    >
                      {alert.priority} • {alert.type}
                    </span>
                    <span className="font-mono text-xs text-slate-400 font-semibold">{alert.id}</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                      <Clock className="w-3.5 h-3.5" />
                      {alert.createdTime}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        alert.status === 'New'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 animate-pulse'
                          : alert.status === 'Escalated'
                          ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}
                    >
                      {alert.status}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {alert.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    {alert.message}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      College: {alert.institutionName}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Current Escalation Tier: <strong className="text-red-600 dark:text-red-400">{alert.escalationStage}</strong>
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {alert.status === 'New' && (
                      <button
                        onClick={() => handleAcknowledge(alert.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Acknowledge</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleSnooze(alert.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-200 transition"
                    >
                      <span>Snooze (3 Days)</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB 2: VISUAL ESCALATION MATRIX --- */}
      {activeTab === 'escalation' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-gov space-y-6">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Automated Statutory Escalation Ladder
            </h3>
            <p className="text-xs text-slate-500">
              When an alert remains unacknowledged, the system triggers automatic upward escalation across three administrative authorities.
            </p>
          </div>

          {/* Visual 3-Stage Ladder */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Step 1 */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-lg bg-aicte-100 dark:bg-aicte-950 text-aicte-700 font-bold flex items-center justify-center">1</span>
                <span className="text-[10px] font-bold text-slate-400">0 - 24 Hours</span>
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">RO Level 1 Scrutiny Officer</h4>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Primary regional scrutiny officer receives in-app alert, SMS, and WhatsApp dispatch to act on deficiency or schedule inspection.
              </p>
              <div className="pt-2 text-[10px] text-slate-400">Channels: In-App, Email, SMS</div>
            </div>

            {/* Step 2 */}
            <div className="p-5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-lg bg-amber-200 dark:bg-amber-900 text-amber-800 font-bold flex items-center justify-center">2</span>
                <span className="text-[10px] font-bold text-amber-600">24 - 72 Hours Unacknowledged</span>
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Regional Director (Western / Southern / Northern)</h4>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Supervisory escalation triggered automatically. Dispatches formal show-cause warning to the college and marks officer SLA overdue.
              </p>
              <div className="pt-2 text-[10px] text-amber-700 dark:text-amber-400 font-semibold">Priority elevated to HIGH</div>
            </div>

            {/* Step 3 */}
            <div className="p-5 rounded-2xl bg-red-50/60 dark:bg-red-950/20 border border-red-200 dark:border-red-800 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-lg bg-red-200 dark:bg-red-900 text-red-800 font-bold flex items-center justify-center">3</span>
                <span className="text-[10px] font-bold text-red-600">&gt; 72 Hours Unresolved</span>
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Member Secretary AICTE (Executive Head)</h4>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Placed on agenda for Standing Hearing Committee (SHC). Automated provisional freeze on intake expansion or approval letters.
              </p>
              <div className="pt-2 text-[10px] text-red-600 font-bold">CRITICAL STATUTORY ESCALATION</div>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 3: CALENDAR VIEW --- */}
      {activeTab === 'calendar' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-gov space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Statutory Deadlines & Inspection Schedule
              </h3>
              <p className="text-xs text-slate-500">Upcoming statutory cutoffs tracked by the automated threshold engine.</p>
            </div>
            <span className="text-xs font-semibold text-aicte-600">October - November 2026</span>
          </div>

          <div className="space-y-3">
            {calendarEvents.map((evt, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-900 border flex flex-col items-center justify-center shadow-xs">
                    <span className="text-[10px] font-bold uppercase text-red-600">{evt.date.split('-')[1]}</span>
                    <span className="text-base font-black text-slate-900 dark:text-white">{evt.date.split('-')[2]}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs">{evt.title}</h4>
                    <p className="text-[11px] text-slate-500">{evt.college}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-red-600 dark:text-red-400">
                    {evt.daysLeft} Days Remaining
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">
                    {evt.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB 4: CHANNELS & DELIVERY LOGS --- */}
      {activeTab === 'channels' && (
        <div className="space-y-6">
          {/* Notification Channel Toggles */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-gov space-y-4 text-xs">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Multi-Channel Alert Configuration
            </h3>
            <p className="text-slate-500">
              Configure how automated threshold alerts are transmitted to authorized college registrars and AICTE officers.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              <label className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border flex items-center justify-between cursor-pointer">
                <div>
                  <span className="font-bold block text-slate-900 dark:text-white">In-App Alerts</span>
                  <span className="text-[10px] text-slate-400">Bell badge & live toast popups</span>
                </div>
                <input
                  type="checkbox"
                  checked={channelSettings.inApp}
                  onChange={e => setChannelSettings({ ...channelSettings, inApp: e.target.checked })}
                  className="rounded text-aicte-600 w-4 h-4"
                />
              </label>

              <label className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border flex items-center justify-between cursor-pointer">
                <div>
                  <span className="font-bold block text-slate-900 dark:text-white">NIC Gov Email</span>
                  <span className="text-[10px] text-slate-400">Official statutory dispatches</span>
                </div>
                <input
                  type="checkbox"
                  checked={channelSettings.email}
                  onChange={e => setChannelSettings({ ...channelSettings, email: e.target.checked })}
                  className="rounded text-aicte-600 w-4 h-4"
                />
              </label>

              <label className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border flex items-center justify-between cursor-pointer">
                <div>
                  <span className="font-bold block text-slate-900 dark:text-white">SMS Gateway</span>
                  <span className="text-[10px] text-slate-400">Critical deadline reminders</span>
                </div>
                <input
                  type="checkbox"
                  checked={channelSettings.sms}
                  onChange={e => setChannelSettings({ ...channelSettings, sms: e.target.checked })}
                  className="rounded text-aicte-600 w-4 h-4"
                />
              </label>

              <label className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border flex items-center justify-between cursor-pointer">
                <div>
                  <span className="font-bold block text-slate-900 dark:text-white">WhatsApp Business</span>
                  <span className="text-[10px] text-slate-400">Interactive quick replies</span>
                </div>
                <input
                  type="checkbox"
                  checked={channelSettings.whatsapp}
                  onChange={e => setChannelSettings({ ...channelSettings, whatsapp: e.target.checked })}
                  className="rounded text-aicte-600 w-4 h-4"
                />
              </label>
            </div>
          </div>

          {/* Simulated Delivery Logs */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-gov space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Real-Time Statutory Delivery Audit Log
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b">
                  <tr>
                    <th className="p-3">Log ID</th>
                    <th className="p-3">Channel</th>
                    <th className="p-3">Recipient</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Message Snippet</th>
                    <th className="p-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {deliveryLogs.map(l => (
                    <tr key={l.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-mono font-bold text-aicte-600 dark:text-saffron-400">{l.id}</td>
                      <td className="p-3 font-semibold">{l.channel}</td>
                      <td className="p-3 font-mono text-slate-500">{l.recipient}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          {l.status}
                        </span>
                      </td>
                      <td className="p-3 text-slate-700 dark:text-slate-300 max-w-xs truncate">{l.message}</td>
                      <td className="p-3 text-slate-400">{l.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
