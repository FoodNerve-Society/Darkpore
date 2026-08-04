'use client';

import React, { useState } from 'react';
import { 
  Box, Typography, IconButton, MenuItem, alpha, useTheme, Paper, Alert, Button
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import CheckIcon from '@mui/icons-material/Check';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useSociety, checkGatekeeper } from '@/context/SocietyContext';
import { useRouter } from 'next/navigation';
import PremiumButton from '@/components/PremiumButton';
import PremiumTextField from '@/components/PremiumTextField';
import PremiumAutocomplete from '@/components/PremiumAutocomplete';
import PremiumDatePicker from '@/components/PremiumDatePicker';
import PremiumTimePicker from '@/components/PremiumTimePicker';
import PremiumSwitch from '@/components/PremiumSwitch';
import { scheduleCalendarEvent } from '@/app/actions/calendar';
import { ECOSYSTEM_EVENT_TYPES } from '@/lib/config/eventTypes';

import { getTenantConfig, ERAS, FOOD_TYPES, VALUE_CHAIN_ACTORS } from '@/lib/cms';

const BLOCK_DEFINITIONS: Record<string, { label: string, color: string }> = {
  core: { label: 'Core', color: '#3b82f6' },
  scopes: { label: 'Scopes', color: '#ef4444' },
  org_timeline: { label: 'Internal Workflow', color: '#f59e0b' },
  soc_timeline: { label: 'Society Broadcast', color: '#10b981' },
  per_timeline: { label: 'Personal Timeline', color: '#8b5cf6' }
};

interface AddEventSidebarProps {
  onClose: () => void;
  tenantId: string;
  initialDate?: Date;
  onDateChange?: (date: Date) => void;
}

export default function AddEventSidebar({ onClose, tenantId, initialDate, onDateChange }: AddEventSidebarProps) {
  const theme = useTheme();
  const router = useRouter();
  const { user, profile } = useSociety();
  
  const [scopes, setScopes] = useState<('personal' | 'organization' | 'society')[]>([]);
  const defaultDate = initialDate ? initialDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
  const [timelines, setTimelines] = useState<Record<string, any>>({
    personal: { dateType: 'START_TIME', allDay: false, date: '', time: '', endDate: '', endTime: '', tasks: [{ id: '1', text: '', done: false }] },
    organization: { dateType: 'START_TIME', allDay: false, date: '', time: '', endDate: '', endTime: '', orgId: '', rules: '', tasks: [{ id: '1', text: '', done: false }] },
    society: { dateType: 'START_TIME', allDay: false, date: '', time: '', endDate: '', endTime: '', description: '', tasks: [{ id: '1', text: '', done: false }] }
  });

  const [eventType, setEventType] = useState<string>('general');
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [challengeId, setChallengeId] = useState<any>(null);
  const [subcategoryId, setSubcategoryId] = useState<string>('');
  const [includeTaxonomy, setIncludeTaxonomy] = useState(false);
  const [eraId, setEraId] = useState<string>(ERAS[0]?.id || '');
  const [foodTypeId, setFoodTypeId] = useState<string>('');
  const [valueChainActorId, setValueChainActorId] = useState<string>('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [flippedBlockId, setFlippedBlockId] = useState<string | null>('core');

  const tenantConfig = getTenantConfig(tenantId);
  const categories = tenantConfig.com.homepage.challenges;
  const isSociety = scopes.includes('society');

  const framework = [
    { id: 'core', type: 'core', role: 'Core Identity', desc: 'Title, Event Type, Content & Taxonomy' },
    { id: 'scopes', type: 'scopes', role: 'Target Scopes', desc: 'Who is this event for?' },
    ...(scopes.includes('organization') ? [{ id: 'org_timeline', type: 'org_timeline', role: 'Internal Workflow', desc: 'Deadline & Assignees' }] : []),
    ...(scopes.includes('society') ? [{ id: 'soc_timeline', type: 'soc_timeline', role: 'Public Broadcast', desc: 'Publish Date & Time' }] : []),
    ...(scopes.includes('personal') ? [{ id: 'per_timeline', type: 'per_timeline', role: 'Personal Reminder', desc: 'Reminder Date & Time' }] : []),
  ];

  if (!user || !profile) {
    return (
      <Box sx={sidebarStyles}>
        <Header onClose={onClose} />
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', p: { xs: 3, md: 5 } }}>
          
          <Box sx={{
            position: 'relative', mb: 4,
            '&::before': {
              content: '""', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              width: '120px', height: '120px', background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.4)} 0%, transparent 70%)`,
              zIndex: 0, filter: 'blur(10px)'
            }
          }}>
            <Box sx={{ 
              position: 'relative', zIndex: 1, width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: '24px', background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.02))',
              border: '1px solid rgba(255,255,255,0.15)', boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 2px 0 0 rgba(255,255,255,0.2)',
              backdropFilter: 'blur(12px)'
            }}>
              <LockOutlinedIcon sx={{ fontSize: 36, color: '#fff', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} />
            </Box>
          </Box>

          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1.5, color: '#fff', letterSpacing: '-0.02em', textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>
            Restricted Access
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)', mb: 5, lineHeight: 1.7, maxWidth: '320px', marginX: 'auto', fontWeight: 500 }}>
            While the calendar is open for public viewing, you need to sign in and reach <strong>Rank 4</strong> to schedule events or host livestreams. Registered members also receive personalized daily calendar reminders via email.
          </Typography>
        </Box>
        <Box sx={{ p: { xs: 3, md: 5 }, pt: 0, width: '100%' }}>
          <Button
            onClick={() => router.push('/join')}
            sx={{ 
              width: '100%',
              py: 1.8,
              borderRadius: '100px',
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              color: '#fff',
              fontWeight: 900,
              fontSize: '1.05rem',
              letterSpacing: '0.5px',
              textTransform: 'none',
              boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.4)}, inset 0 2px 0 0 rgba(255,255,255,0.2)`,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                background: `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
                boxShadow: `0 16px 48px ${alpha(theme.palette.primary.main, 0.6)}, inset 0 2px 0 0 rgba(255,255,255,0.3)`,
                transform: 'translateY(-2px)'
              }
            }}
          >
            Join the Ecosystem
          </Button>
        </Box>
      </Box>
    );
  }

  const gatekeeper = isSociety ? checkGatekeeper(profile, 4) : { allowed: true };

  const handleSubmit = async () => {
    if (!title) return;
    if (scopes.includes('society') && (!challengeId || !subcategoryId)) {
      alert("Category and Subcategory are required for Society postings.");
      return;
    }
    
    setIsSubmitting(true);
    
    const finalTags = tags.length > 0 ? JSON.stringify(tags) : undefined;
    
    try {
      const result = await scheduleCalendarEvent({
        eventType: eventType as any,
        title,
        challengeId: includeTaxonomy ? challengeId?.id : undefined,
        subcategoryId: includeTaxonomy ? subcategoryId : undefined,
        eraId: includeTaxonomy ? eraId : undefined,
        foodTypeId: includeTaxonomy ? foodTypeId : undefined,
        valueChainActorId: includeTaxonomy ? valueChainActorId : undefined,
        tenantId,
        tags: finalTags,
        scopes,
        timelines
      });

      if (result.success) {
        setIsSuccess(true);
      } else {
        throw new Error(result.error || 'Failed to schedule event');
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong scheduling the event.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getBlockFillStats = (blockId: string) => {
    let filled = 0; let total = 1;
    switch(blockId) {
      case 'core':
        total = scopes.includes('society') ? 4 : 2; 
        if (title) filled++;
        if (eventType) filled++;
        if (scopes.includes('society')) {
           if (challengeId) filled++;
           if (subcategoryId) filled++;
        }
        break;
      case 'scopes':
        total = 1;
        if (scopes.length > 0) filled++;
        break;
      case 'org_timeline':
        total = 2; 
        if (timelines.organization.date) filled++;
        if (timelines.organization.time) filled++;
        break;
      case 'soc_timeline':
        total = 2;
        if (timelines.society.date) filled++;
        if (timelines.society.time) filled++;
        break;
      case 'per_timeline':
        total = 2;
        if (timelines.personal.date) filled++;
        if (timelines.personal.time) filled++;
        break;
    }
    return { filled, total };
  };

  const isBlockFilled = (blockId: string) => {
    const stats = getBlockFillStats(blockId);
    return stats.filled >= stats.total;
  };

  const allFilled = framework.every(b => isBlockFilled(b.id));

  if (isSuccess) {
    return (
      <Box sx={sidebarStyles}>
        <Header onClose={onClose} />
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', p: 3 }}>
          <Box sx={{ 
            p: 3, bgcolor: 'rgba(76, 175, 80, 0.1)', borderRadius: '50%', mb: 3, boxShadow: '0 0 30px rgba(76, 175, 80, 0.2)' 
          }}>
            <CheckCircleOutlinedIcon sx={{ fontSize: 64, color: '#4caf50' }} />
          </Box>
          <Typography variant="h4" sx={{ fontFamily: 'var(--font-dosis)', fontWeight: 800, mb: 1, color: '#fff' }}>
            {eventType === 'general' ? 'Event Secured' : 'Draft Initialized'}
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.6)', mb: 5, lineHeight: 1.6 }}>
            {eventType === 'general' 
              ? 'Your event has been successfully logged to the secure timeline.' 
              : 'Your scheduled draft has been created and securely stored.'}
          </Typography>
        </Box>
        <Box sx={footerStyles}>
          <PremiumButton variant="filled" baseColor="#4caf50" onClick={() => {
            if (eventType !== 'general' && challengeId && subcategoryId) {
              const selectedType = ECOSYSTEM_EVENT_TYPES.find(t => t.id === eventType);
              const targetTab = selectedType?.tab || 'learn';
              router.push(`/${challengeId.id}/${subcategoryId}/${targetTab}`);
            } else {
              onClose();
            }
          }} sx={{ width: '100%' }}>
            {eventType === 'general' ? 'Acknowledge' : 'Proceed to Draft'}
          </PremiumButton>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={sidebarStyles}>
      <Header onClose={onClose} />

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', p: { xs: 3, md: 4 }, pt: 0, '&::-webkit-scrollbar': { display: 'none' } }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          {framework.map((b, i) => {
            const isFlipped = flippedBlockId === b.id;
            const fillStats = getBlockFillStats(b.id);
            const filled = fillStats.filled >= fillStats.total;
            const fillPercent = fillStats.total === 0 ? 100 : Math.min(100, Math.round((fillStats.filled / fillStats.total) * 100));
            const bDef = BLOCK_DEFINITIONS[b.type] || { color: '#ef4444', label: 'Block' };
            const color = bDef.color;

            let filledSummary = 'Content added — tap to edit';
            if (filled) {
              if (b.id === 'core') {
                const typeLabel = ECOSYSTEM_EVENT_TYPES.find(t => t.id === eventType)?.label || 'Event';
                filledSummary = `${title || 'No Title'} • ${typeLabel}`;
              }
              if (b.id === 'scopes') {
                const scopeLabels = [];
                if (scopes.includes('personal')) scopeLabels.push('Personal');
                if (scopes.includes('organization')) scopeLabels.push('Organization');
                if (scopes.includes('society')) scopeLabels.push('Society');
                filledSummary = scopeLabels.length > 0 ? scopeLabels.join(' • ') : 'No scopes selected';
              }
              if (b.id === 'org_timeline') {
                filledSummary = `${timelines.organization.date} ${timelines.organization.allDay ? '(All Day)' : timelines.organization.time}`;
              }
              if (b.id === 'soc_timeline') {
                filledSummary = `${timelines.society.date} ${timelines.society.allDay ? '(All Day)' : timelines.society.time}`;
              }
              if (b.id === 'per_timeline') {
                filledSummary = `${timelines.personal.date} ${timelines.personal.allDay ? '(All Day)' : timelines.personal.time}`;
              }
            }

            return (
              <Box key={b.id} id={`block-${b.id}`} sx={{ perspective: '1600px', mb: 2.5 }}>
                <Box sx={{
                  position: 'relative',
                  transition: 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  transformStyle: 'preserve-3d',
                  transformOrigin: 'center center',
                  transform: isFlipped ? 'rotateX(-180deg)' : 'none',
                }}>
                  {/* FRONT FACE */}
                  <Box
                    onClick={() => !isFlipped && setFlippedBlockId(b.id)}
                    sx={{
                      backfaceVisibility: 'hidden',
                      position: isFlipped ? 'absolute' : 'relative',
                      width: '100%', top: 0,
                      borderRadius: '20px',
                      border: `1px solid ${filled ? alpha(color, 0.8) : 'rgba(255,255,255,0.2)'}`,
                      background: filled 
                        ? `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.8)} 100%)`
                        : `linear-gradient(to right, ${alpha(color, 0.4)} ${fillPercent}%, rgba(255,255,255,0.15) ${fillPercent}%, rgba(255,255,255,0.05) 100%)`,
                      backdropFilter: 'blur(24px)',
                      boxShadow: filled ? `0 12px 32px ${alpha(color, 0.3)}` : `0 8px 32px rgba(0,0,0,0.4), inset 0 2px 0 0 rgba(255,255,255,0.1)`,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
                      '&:hover': {
                        borderColor: filled ? color : alpha(color, 0.5),
                        boxShadow: filled ? `0 16px 48px ${alpha(color, 0.4)}` : `0 12px 48px rgba(0,0,0,0.5), inset 0 2px 0 0 rgba(255,255,255,0.2)`,
                        transform: 'translateY(-2px)'
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'stretch', position: 'relative', zIndex: 1 }}>
                      <Box sx={{ width: filled ? 0 : 6, flexShrink: 0, background: filled ? `transparent` : `linear-gradient(180deg, ${color} 0%, ${alpha(color, 0.3)} 100%)` }} />
                      <Box sx={{ p: 2, flex: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{
                          width: 36, height: 36, borderRadius: '10px', flexShrink: 0,
                          bgcolor: filled ? 'rgba(255,255,255,0.2)' : alpha(color, 0.15), 
                          border: filled ? '1px solid rgba(255,255,255,0.3)' : `1px solid ${alpha(color, 0.3)}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          boxShadow: filled ? 'none' : `0 0 16px ${alpha(color, 0.2)}`
                        }}>
                          {filled ? <CheckIcon sx={{ color: '#fff', fontSize: 18 }} /> : <Typography sx={{ fontWeight: 900, fontSize: '1rem', color }}>{i + 1}</Typography>}
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography sx={{ fontWeight: 800, color: '#fff', fontSize: '1.05rem', letterSpacing: '-0.01em', mb: 0.2 }}>
                              {b.role}
                            </Typography>
                            <Typography sx={{ color: filled ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.6)', fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600 }}>
                              {filled ? filledSummary : b.desc}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  </Box>

                  {/* BACK FACE */}
                  <Box sx={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateX(180deg)',
                    position: isFlipped ? 'relative' : 'absolute',
                    width: '100%', top: 0,
                    borderRadius: '20px',
                    border: `1px solid ${alpha(color, 0.4)}`,
                    background: `linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(248,250,252,0.95) 100%)`,
                    backdropFilter: 'blur(20px)',
                    boxShadow: `0 16px 48px rgba(0,0,0,0.08)`,
                    overflow: 'hidden',
                  }}>
                    <Box sx={{
                      display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.5,
                      borderBottom: `1px solid rgba(0,0,0,0.06)`, background: alpha(color, 0.05),
                    }}>
                      <Box sx={{ width: 28, height: 28, borderRadius: '8px', bgcolor: alpha(color, 0.15), display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${alpha(color, 0.2)}` }}>
                        <Typography sx={{ fontWeight: 800, fontSize: '0.8rem', color }}>{i + 1}</Typography>
                      </Box>
                      <Typography sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem', flex: 1 }}>
                        {b.role}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => setFlippedBlockId(null)}
                        sx={{ bgcolor: color, color: '#fff', boxShadow: `0 4px 12px ${alpha(color, 0.3)}`, '&:hover': { bgcolor: alpha(color, 0.9), transform: 'scale(1.05)' } }}
                      >
                        <CheckIcon sx={{ fontSize: 16, fontWeight: 900 }} />
                      </IconButton>
                    </Box>

                    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                      
                      {/* --- BLOCK 1: TARGET SCOPE --- */}
                      {b.id === 'core' && (
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2 }}>
                          <PremiumTextField 
                            label="Event Title" placeholder="e.g. Q3 Roadmap Review" 
                            fullWidth size="small" value={title} onChange={(e: any) => setTitle(e.target.value)} colorTheme={color}
                          />
                          <Typography sx={{ fontWeight: 800, color: '#334155', fontSize: '0.85rem', mt: 1 }}>Event Type</Typography>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <PremiumAutocomplete
                              label="Select Event Type"
                              options={ECOSYSTEM_EVENT_TYPES.filter(t => t.isActive)}
                              getOptionLabel={(opt) => opt.label}
                              value={ECOSYSTEM_EVENT_TYPES.find((t) => t.id === eventType) || ECOSYSTEM_EVENT_TYPES[0]}
                              onChange={(e, val) => setEventType(val ? val.id : 'general')}
                              colorTheme={color}
                            />
                            <Typography sx={{ fontSize: '0.75rem', color: '#64748b', ml: 1, fontWeight: 600 }}>
                              {(ECOSYSTEM_EVENT_TYPES.find((t) => t.id === eventType) || ECOSYSTEM_EVENT_TYPES[0]).description}
                            </Typography>
                          </Box>
                        </Box>
                      )}

                      {b.id === 'scopes' && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                          <PremiumChecklistItem 
                            title="Personal Calendar" desc="Only visible to you" color={color} 
                            selected={scopes.includes('personal')} 
                            onClick={() => {
                              if (scopes.includes('personal')) setScopes(scopes.filter(s => s !== 'personal'));
                              else setScopes([...scopes, 'personal']);
                            }}
                          />
                          {profile.organizations && profile.organizations.length > 0 && (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                              <PremiumChecklistItem 
                                title={timelines.organization.orgId && profile.organizations?.find((o: any) => o.id === timelines.organization.orgId) ? `Organization: ${profile.organizations.find((o: any) => o.id === timelines.organization.orgId)?.name}` : "Organization Workspace"} 
                                desc={timelines.organization.orgId ? "Sync with this team's agenda" : "Select a workspace below to sync agenda"}
                                color={color} 
                                selected={scopes.includes('organization')} 
                                onClick={() => {
                                  if (scopes.includes('organization')) setScopes(scopes.filter(s => s !== 'organization'));
                                  else setScopes([...scopes, 'organization']);
                                }}
                              />
                              {scopes.includes('organization') && (
                                <Box sx={{ 
                                  ml: 4, pl: 2, borderLeft: `2px solid ${alpha(color, 0.2)}`, 
                                  display: 'flex', flexDirection: 'column', gap: 1 
                                }}>
                                  <Typography sx={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Target Workspace
                                  </Typography>
                                  <PremiumAutocomplete
                                    label="Select Organization"
                                    options={profile.organizations.map((o: any) => ({ id: o.id, label: o.name || 'Unknown' }))}
                                    getOptionLabel={(opt) => opt.label}
                                    value={profile.organizations.find((o: any) => o.id === timelines.organization.orgId) ? { id: timelines.organization.orgId, label: profile.organizations.find((o: any) => o.id === timelines.organization.orgId)?.name } : null}
                                    onChange={(e, val) => setTimelines({ ...timelines, organization: { ...timelines.organization, orgId: val ? val.id : '' } })}
                                    colorTheme={color}
                                  />
                                  {timelines.organization.orgId && (
                                    <Box sx={{ 
                                      mt: 1, p: 2, 
                                      display: 'flex', alignItems: 'center', gap: 2,
                                      bgcolor: alpha(color, 0.05), border: `1px solid ${alpha(color, 0.1)}`, 
                                      borderRadius: 2 
                                    }}>
                                      <Box sx={{ 
                                        width: 40, height: 40, borderRadius: '10px', 
                                        bgcolor: alpha(color, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        overflow: 'hidden', flexShrink: 0
                                      }}>
                                        {profile.organizations.find((o: any) => o.id === timelines.organization.orgId)?.logoUrl ? (
                                          <img src={profile.organizations.find((o: any) => o.id === timelines.organization.orgId)?.logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                          <Typography sx={{ fontWeight: 800, color, fontSize: '1.2rem' }}>
                                            {profile.organizations.find((o: any) => o.id === timelines.organization.orgId)?.name?.charAt(0) || 'O'}
                                          </Typography>
                                        )}
                                      </Box>
                                      <Box>
                                        <Typography sx={{ fontWeight: 800, color: '#1e293b', fontSize: '0.9rem' }}>
                                          {profile.organizations.find((o: any) => o.id === timelines.organization.orgId)?.name}
                                        </Typography>
                                        <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                                          {profile.organizations.find((o: any) => o.id === timelines.organization.orgId)?.role || 'Member'}
                                        </Typography>
                                      </Box>
                                    </Box>
                                  )}
                                </Box>
                              )}
                            </Box>
                          )}
                          <PremiumChecklistItem 
                            title="Society Broadcast" desc="Public event in the ecosystem" color={color} 
                            selected={scopes.includes('society')} 
                            onClick={() => {
                              if (scopes.includes('society')) setScopes(scopes.filter(s => s !== 'society'));
                              else setScopes([...scopes, 'society']);
                            }}
                          />
                          {scopes.includes('society') && eventType !== 'general' && (
                            <Box sx={{ 
                              ml: 4, pl: 2, borderLeft: `2px solid ${alpha(color, 0.2)}`, 
                              display: 'flex', flexDirection: 'column', gap: 1.5 
                            }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                                <Typography sx={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                  Apply Ecosystem Taxonomy
                                </Typography>
                                <PremiumSwitch 
                                  checked={includeTaxonomy} 
                                  onChange={(e: any) => setIncludeTaxonomy(e.target.checked)} 
                                  colorTheme={color} 
                                />
                              </Box>
                              
                              {includeTaxonomy && (
                                <>
                                  <PremiumAutocomplete 
                                    label="Target Era" 
                                    options={ERAS} 
                                    getOptionLabel={(opt) => opt.label} 
                                    value={ERAS.find((e) => e.id === eraId) || null} 
                                    onChange={(e, val) => setEraId(val ? val.id : '')} 
                                    colorTheme={color} 
                                  />
                                  <PremiumAutocomplete label="Mission Category" options={categories} getOptionLabel={(opt) => opt.title} value={challengeId} onChange={(e, val) => { setChallengeId(val); setSubcategoryId(''); }} colorTheme={color} />
                                  <PremiumAutocomplete label="Subcategory / Focus" options={challengeId ? challengeId.subcategories : []} getOptionLabel={(opt) => opt.title} value={challengeId?.subcategories?.find((s: any) => s.id === subcategoryId) || null} onChange={(e, val) => setSubcategoryId(val ? val.id : '')} colorTheme={color} disabled={!challengeId} />
                                  <PremiumAutocomplete label="Food Type" options={FOOD_TYPES} getOptionLabel={(opt) => opt.label} value={FOOD_TYPES.find(v => v.id === foodTypeId) || null} onChange={(e, val) => setFoodTypeId(val ? val.id : '')} colorTheme={color} />
                                  <PremiumAutocomplete label="Value Chain Actor" options={VALUE_CHAIN_ACTORS} getOptionLabel={(opt) => opt.label} value={VALUE_CHAIN_ACTORS.find(v => v.id === valueChainActorId) || null} onChange={(e, val) => setValueChainActorId(val ? val.id : '')} colorTheme={color} />
                                </>
                              )}
                            </Box>
                          )}
                        </Box>
                      )}

                      {(b.id === 'org_timeline' || b.id === 'soc_timeline' || b.id === 'per_timeline') && (() => {
                        const scopeKey = b.id === 'org_timeline' ? 'organization' : b.id === 'soc_timeline' ? 'society' : 'personal';
                        const timeline = timelines[scopeKey];
                        
                        return (
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 1, '&::-webkit-scrollbar': { display: 'none' } }}>
                              {['START_TIME', 'PUBLISH_DATE', 'DATE_RANGE', 'DEADLINE'].map(dt => (
                                <Box 
                                  key={dt}
                                  onClick={() => setTimelines({ ...timelines, [scopeKey]: { ...timeline, dateType: dt, allDay: dt === 'PUBLISH_DATE' ? true : timeline.allDay } })}
                                  sx={{
                                    px: 2, py: 0.8, borderRadius: '100px', cursor: 'pointer', flexShrink: 0,
                                    border: `1px solid ${timeline.dateType === dt ? color : alpha(color, 0.3)}`,
                                    bgcolor: timeline.dateType === dt ? alpha(color, 0.1) : 'transparent',
                                    transition: 'all 0.2s ease',
                                    '&:hover': { bgcolor: alpha(color, 0.05) }
                                  }}
                                >
                                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: timeline.dateType === dt ? color : '#64748b', textTransform: 'capitalize' }}>
                                    {dt === 'START_TIME' ? 'Start Date' : dt === 'PUBLISH_DATE' ? 'Publish Date' : dt === 'DATE_RANGE' ? 'Duration' : 'Deadline / End'}
                                  </Typography>
                                </Box>
                              ))}
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: alpha(color, 0.05), p: 1.5, borderRadius: '12px', border: `1px solid ${alpha(color, 0.1)}` }}>
                              <Typography sx={{ fontWeight: 800, color: '#334155', fontSize: '0.85rem' }}>All Day Event</Typography>
                              <PremiumSwitch 
                                checked={timeline.allDay} 
                                onChange={(e: any) => setTimelines({ ...timelines, [scopeKey]: { ...timeline, allDay: e.target.checked } })} 
                                colorTheme={color} 
                              />
                            </Box>

                            <Box sx={{ display: 'flex', gap: 2 }}>
                              <Box sx={{ flex: 1 }}>
                                <PremiumDatePicker 
                                  label={timeline.dateType === 'DATE_RANGE' ? "Start Date" : "Date"} 
                                  value={timeline.date} 
                                  onChange={(e: any) => setTimelines({ ...timelines, [scopeKey]: { ...timeline, date: e.target.value } })} 
                                  colorTheme={color}
                                />
                              </Box>
                              {!timeline.allDay && (
                                <Box sx={{ flex: 1 }}>
                                  <PremiumTimePicker 
                                    label={timeline.dateType === 'DATE_RANGE' ? "Start Time" : "Time"} 
                                    value={timeline.time} 
                                    onChange={(e: any) => setTimelines({ ...timelines, [scopeKey]: { ...timeline, time: e.target.value } })} 
                                    colorTheme={color}
                                  />
                                </Box>
                              )}
                            </Box>

                            {timeline.dateType === 'DATE_RANGE' && (
                              <Box sx={{ display: 'flex', gap: 2, mt: 0 }}>
                                <Box sx={{ flex: 1 }}>
                                  <PremiumDatePicker 
                                    label="End Date" 
                                    value={timeline.endDate} 
                                    onChange={(e: any) => setTimelines({ ...timelines, [scopeKey]: { ...timeline, endDate: e.target.value } })} 
                                    colorTheme={color}
                                  />
                                </Box>
                                {!timeline.allDay && (
                                  <Box sx={{ flex: 1 }}>
                                    <PremiumTimePicker 
                                      label="End Time" 
                                      value={timeline.endTime} 
                                      onChange={(e: any) => setTimelines({ ...timelines, [scopeKey]: { ...timeline, endTime: e.target.value } })} 
                                      colorTheme={color}
                                    />
                                  </Box>
                                )}
                              </Box>
                            )}

                            {b.id === 'soc_timeline' && (
                              <PremiumTextField 
                                label="Description / Context" 
                                multiline rows={2} fullWidth size="small" 
                                value={timeline.description} 
                                onChange={(e: any) => setTimelines({ ...timelines, [scopeKey]: { ...timeline, description: e.target.value } })} 
                                colorTheme={color} 
                              />
                            )}

                            {b.id === 'org_timeline' && (
                              <PremiumTextField 
                                label="Rules & Guidelines" 
                                multiline rows={2} fullWidth size="small" 
                                value={timeline.rules} 
                                onChange={(e: any) => setTimelines({ ...timelines, [scopeKey]: { ...timeline, rules: e.target.value } })} 
                                colorTheme={color} 
                              />
                            )}

                            <Box sx={{ p: 2, bgcolor: alpha(color, 0.05), borderRadius: 2, border: `1px solid ${alpha(color, 0.2)}` }}>
                              <Typography sx={{ fontWeight: 800, color: '#334155', fontSize: '0.85rem', mb: 1 }}>Tasks (Optional)</Typography>
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                {timeline.tasks && timeline.tasks.map((task: any, idx: number) => (
                                  <Box key={task.id} sx={{ 
                                    display: 'flex', alignItems: 'flex-start', gap: 1.5, p: 1.5,
                                    bgcolor: 'rgba(255,255,255,0.6)', borderRadius: '16px',
                                    border: '1px solid rgba(0,0,0,0.04)',
                                    boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
                                  }}>
                                    <Box sx={{ width: 18, height: 18, mt: 1.2, borderRadius: '6px', border: `2px solid ${alpha(color, 0.4)}`, flexShrink: 0, bgcolor: 'rgba(255,255,255,0.8)' }} />
                                    <PremiumTextField 
                                      label={`Task ${idx + 1}`} fullWidth size="small"
                                      value={task.text} 
                                      onChange={(e: any) => {
                                        const newTasks = timeline.tasks.map((t: any) => t.id === task.id ? { ...t, text: e.target.value } : t);
                                        setTimelines({ ...timelines, [scopeKey]: { ...timeline, tasks: newTasks } });
                                      }} 
                                      colorTheme={color}
                                    />
                                    <IconButton size="small" onClick={() => setTimelines({ ...timelines, [scopeKey]: { ...timeline, tasks: timeline.tasks.filter((t: any) => t.id !== task.id) } })} sx={{ color: '#ef4444', mt: 0.5, bgcolor: 'rgba(239,68,68,0.1)', '&:hover': { bgcolor: 'rgba(239,68,68,0.2)' } }}>
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </Box>
                                ))}
                                <Button 
                                  startIcon={<AddIcon />} size="small" 
                                  onClick={() => {
                                    const newTask = { id: Math.random().toString(), text: '', done: false };
                                    setTimelines({ ...timelines, [scopeKey]: { ...timeline, tasks: [...(timeline.tasks || []), newTask] } });
                                  }} 
                                  sx={{ color, fontWeight: 800, alignSelf: 'flex-start', bgcolor: alpha(color, 0.1), borderRadius: '10px', px: 2, '&:hover': { bgcolor: alpha(color, 0.2) } }}
                                >
                                  Add Task
                                </Button>
                              </Box>
                            </Box>

                            {b.id === 'org_timeline' && (
                               <Box sx={{ p: 2, bgcolor: alpha(color, 0.05), borderRadius: 2, border: `1px solid ${alpha(color, 0.2)}` }}>
                                 <Typography sx={{ fontWeight: 800, color: '#334155', fontSize: '0.85rem', mb: 1 }}>Assignees (Mockup)</Typography>
                                 <Box sx={{ display: 'flex', gap: 1 }}>
                                   <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: '#cbd5e1' }} />
                                   <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: '#cbd5e1' }} />
                                   <Box sx={{ width: 32, height: 32, borderRadius: '50%', border: '1px dashed #94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                     <AddIcon sx={{ fontSize: 16, color: '#94a3b8' }} />
                                   </Box>
                                 </Box>
                               </Box>
                            )}
                          </Box>
                        );
                      })()}
                    </Box>
                  </Box>
                </Box>
              </Box>
            );
          })}

          <Box sx={{ mt: 'auto', pt: 4, pb: 2 }}>
            {!allFilled && (
              <Alert severity="info" sx={{ mb: 2, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.05)', color: '#fff', '& .MuiAlert-icon': { color: '#fff' }, border: '1px solid rgba(255,255,255,0.1)' }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>Incomplete</Typography>
                Complete all blocks to schedule your event.
              </Alert>
            )}
            <PremiumButton 
              variant="filled"
              baseColor="#3b82f6"
              disabled={isSubmitting || !allFilled || (isSociety && (!gatekeeper.allowed))}
              onClick={handleSubmit}
              sx={{ width: '100%' }}
            >
              {isSubmitting ? 'Processing...' : (eventType === 'general' ? 'Schedule Event' : 'Initialize Scheduled Draft')}
            </PremiumButton>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

// --- HELPER COMPONENTS ---

const CardChoice = ({ title, desc, color, selected, onClick }: any) => (
  <Box 
    onClick={onClick}
    sx={{ 
      p: 2, borderRadius: '16px', display: 'flex', alignItems: 'flex-start', gap: 2,
      border: `1px solid ${selected ? alpha(color, 0.6) : 'rgba(0,0,0,0.06)'}`, 
      background: selected 
        ? `linear-gradient(135deg, ${alpha(color, 0.08)} 0%, rgba(255,255,255,0.95) 100%)` 
        : 'rgba(255,255,255,0.7)',
      boxShadow: selected 
        ? `0 12px 32px ${alpha(color, 0.15)}, inset 0 2px 0 0 rgba(255,255,255,0.7)` 
        : '0 4px 16px rgba(0,0,0,0.03), inset 0 2px 0 0 rgba(255,255,255,0.5)',
      cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
      position: 'relative',
      backdropFilter: 'blur(12px)',
      '&:hover': { 
        background: selected 
          ? `linear-gradient(135deg, ${alpha(color, 0.12)} 0%, rgba(255,255,255,0.98) 100%)` 
          : 'rgba(255,255,255,0.95)', 
        borderColor: selected ? color : alpha(color, 0.3), 
        transform: 'translateY(-2px)',
        boxShadow: selected 
          ? `0 16px 40px ${alpha(color, 0.2)}, inset 0 2px 0 0 rgba(255,255,255,1)` 
          : '0 8px 24px rgba(0,0,0,0.06), inset 0 2px 0 0 rgba(255,255,255,0.8)'
      }
    }}
  >
    <Box sx={{ mt: 0.2, display: 'flex', alignItems: 'center', justifyContent: 'center', color: selected ? color : '#cbd5e1' }}>
      {selected ? <RadioButtonCheckedIcon /> : <RadioButtonUncheckedIcon />}
    </Box>
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: selected ? '#0f172a' : '#475569', mb: desc ? 0.25 : 0, letterSpacing: '-0.01em' }}>
        {title}
      </Typography>
      {desc && <Typography sx={{ fontSize: '0.8rem', color: selected ? '#475569' : '#94a3b8', fontWeight: 500, lineHeight: 1.4 }}>{desc}</Typography>}
    </Box>
  </Box>
);

const PremiumChecklistItem = ({ title, desc, color, selected, onClick }: any) => (
  <Box 
    onClick={onClick}
    sx={{ 
      display: 'flex', alignItems: 'center', gap: 2, p: 2, 
      borderRadius: '16px', cursor: 'pointer',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      border: `1px solid ${selected ? color : 'rgba(0,0,0,0.05)'}`,
      bgcolor: selected ? alpha(color, 0.05) : '#fff',
      '&:hover': {
        bgcolor: selected ? alpha(color, 0.08) : 'rgba(0,0,0,0.02)',
        borderColor: selected ? color : 'rgba(0,0,0,0.1)'
      }
    }}
  >
    <Box sx={{ 
      width: 24, height: 24, borderRadius: '6px', 
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      border: `2px solid ${selected ? color : '#cbd5e1'}`,
      bgcolor: selected ? color : 'transparent',
      transition: 'all 0.2s ease',
      color: '#fff'
    }}>
      {selected && <CheckIcon sx={{ fontSize: 16, fontWeight: 900 }} />}
    </Box>
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: '#1e293b', letterSpacing: '-0.01em' }}>
        {title}
      </Typography>
      {desc && <Typography sx={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500, lineHeight: 1.4 }}>{desc}</Typography>}
    </Box>
  </Box>
);

const Header = ({ onClose }: { onClose: () => void }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: { xs: 3, md: 4 }, pb: 2 }}>
    <Typography variant="h5" sx={{ fontFamily: 'var(--font-dosis)', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>
      Create Event
    </Typography>
    <IconButton 
      size="small" onClick={onClose} 
      sx={{ 
        bgcolor: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)',
        backdropFilter: 'blur(10px)', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', color: '#fff', transform: 'rotate(90deg)' },
      }}
    >
      <CloseIcon fontSize="small" />
    </IconButton>
  </Box>
);

const sidebarStyles = {
  width: '100%', 
  minWidth: 320, 
  bgcolor: 'rgba(12, 12, 14, 0.75)', 
  backdropFilter: 'blur(32px) saturate(180%)', 
  borderRadius: { xs: 0, md: '24px' }, 
  border: { xs: 'none', md: '1px solid rgba(255,255,255,0.08)' }, 
  boxShadow: '-10px 0 40px rgba(0,0,0,0.4)',
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
};

const footerStyles = {
  p: { xs: 3, md: 4 }, pt: 3, pb: { xs: 4, md: 4 },
  borderTop: '1px solid rgba(255,255,255,0.06)',
  bgcolor: 'rgba(0,0,0,0.3)',
  backdropFilter: 'blur(10px)'
};
