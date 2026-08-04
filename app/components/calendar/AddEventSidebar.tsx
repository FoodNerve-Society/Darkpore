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

import { getTenantConfig, ERAS } from '@/lib/cms';

const BLOCK_DEFINITIONS: Record<string, { label: string, color: string }> = {
  scope: { label: 'Scope', color: '#ef4444' },
  type: { label: 'Format', color: '#f59e0b' },
  taxonomy: { label: 'Taxonomy', color: '#10b981' },
  details: { label: 'Details', color: '#3b82f6' }
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
  
  const [targetScope, setTargetScope] = useState<'personal' | 'organization' | 'society'>('personal'); // personal, organization, society
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [eventType, setEventType] = useState<'article' | 'livestream' | 'general'>('general'); // general, article, livestream
  const [dateType, setDateType] = useState<'START_TIME' | 'DEADLINE' | 'PUBLISH_DATE' | 'DATE_RANGE'>('START_TIME'); // START_TIME, DEADLINE, PUBLISH_DATE, DATE_RANGE
  
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(initialDate ? initialDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('10:00');
  
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('11:00');
  const [isAllDay, setIsAllDay] = useState(false);
  
  const [contentType, setContentType] = useState<'text' | 'todo'>('text');
  const [description, setDescription] = useState('');
  const [todoItems, setTodoItems] = useState<{id: string, text: string, done: boolean}[]>([]);
  
  const [tags, setTags] = useState<string[]>([]);
  const [challengeId, setChallengeId] = useState<any>(null);
  const [subcategoryId, setSubcategoryId] = useState<string>('');
  const [eraId, setEraId] = useState<string>('ideation');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [flippedBlockId, setFlippedBlockId] = useState<string | null>('scope');

  const tenantConfig = getTenantConfig(tenantId);
  const categories = tenantConfig.com.homepage.challenges;
  const isSociety = targetScope === 'society';

  const framework = [
    { id: 'scope', type: 'scope', role: 'Target Scope', desc: 'Where is this event being posted?' },
    { id: 'type', type: 'type', role: 'Event Type', desc: 'What kind of event is this?' },
    ...(isSociety ? [{ id: 'taxonomy', type: 'taxonomy', role: 'Ecosystem Categorization', desc: 'Category, Subcategory, and Era' }] : []),
    { id: 'details', type: 'details', role: 'Details & Specifics', desc: 'Title, Date, Content, and Tags' }
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

  const isOrg = targetScope === 'organization';
  const gatekeeper = isSociety ? checkGatekeeper(profile, 4) : { allowed: true };

  const handleAddTodo = () => {
    setTodoItems([...todoItems, { id: Math.random().toString(), text: '', done: false }]);
  };
  const updateTodo = (id: string, text: string) => {
    setTodoItems(todoItems.map(t => t.id === id ? { ...t, text } : t));
  };
  const removeTodo = (id: string) => {
    setTodoItems(todoItems.filter(t => t.id !== id));
  };

  const handleSubmit = async () => {
    if (!title || !date || !time) return;
    if (isSociety && (!challengeId || !subcategoryId)) {
      alert("Category and Subcategory are required for Society postings.");
      return;
    }
    
    setIsSubmitting(true);
    
    const finalDescription = contentType === 'todo' ? JSON.stringify(todoItems) : description;
    const finalTags = tags.length > 0 ? JSON.stringify(tags) : undefined;
    
    try {
      const result = await scheduleCalendarEvent({
        targetScope,
        selectedOrgId: selectedOrgId || undefined,
        eventType,
        dateType,
        title,
        date,
        time: isAllDay ? '00:00' : time,
        endDate: endDate || undefined,
        endTime: isAllDay ? '23:59' : (endTime || undefined),
        challengeId: challengeId?.id,
        subcategoryId,
        eraId,
        tenantId,
        description: finalDescription,
        tags: finalTags
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
    let filled = 0;
    let total = 1;
    switch(blockId) {
      case 'scope':
        total = isOrg ? 2 : 1; // TargetScope + SelectedOrgId
        if (targetScope) filled++;
        if (isOrg && selectedOrgId) filled++;
        break;
      case 'type':
        total = 1; 
        if (eventType) filled++;
        break;
      case 'taxonomy':
        total = 3; // challenge, subcategory, era
        if (challengeId) filled++;
        if (subcategoryId) filled++;
        if (eraId) filled++;
        break;
      case 'details':
        total = 3; // title, date, time
        if (title) filled++;
        if (date) filled++;
        if (time) filled++;
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
              router.push(`/${challengeId.id}/${subcategoryId}/learn`);
            } else {
              onClose();
            }
          }} sx={{ width: '100%' }}>
            {eventType === 'general' ? 'Acknowledge' : 'Proceed to Learn Tab'}
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
              if (b.id === 'scope') filledSummary = targetScope === 'organization' ? `Organization Target` : targetScope === 'society' ? `Society (Public)` : `Personal Target`;
              if (b.id === 'type') filledSummary = eventType === 'article' ? 'Article Draft' : eventType === 'livestream' ? 'Livestream Draft' : 'General Event';
              if (b.id === 'taxonomy') filledSummary = `${challengeId?.title || 'Category'} • ${eraId}`;
              if (b.id === 'details') filledSummary = `${title || 'No Title'} • ${date} ${time}`;
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
                      {b.id === 'scope' && (
                        <>
                          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 1.5 }}>
                            <CardChoice 
                              title="Personal Calendar" desc="Only visible to you" color={color} 
                              selected={targetScope === 'personal'} onClick={() => { setTargetScope('personal'); }}
                            />
                            
                            {profile.organizations && profile.organizations.length > 0 && (
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <CardChoice 
                                  title="Organization" desc="Sync with your team's agenda" color={color} 
                                  selected={targetScope === 'organization'} onClick={() => { setTargetScope('organization'); }}
                                />
                                {targetScope === 'organization' && (
                                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 1, px: 1, pb: 0.5 }}>
                                    {profile.organizations.map((o: any) => (
                                      <CardChoice
                                        key={o.organizationId}
                                        title={o.organization?.name || 'Unknown Organization'}
                                        color={color}
                                        selected={selectedOrgId === o.organizationId}
                                        onClick={() => setSelectedOrgId(o.organizationId)}
                                      />
                                    ))}
                                  </Box>
                                )}
                              </Box>
                            )}
                            
                            <CardChoice 
                              title="Society Broadcast" desc="Public event in the ecosystem" color={color} 
                              selected={targetScope === 'society'} onClick={() => { setTargetScope('society'); }}
                            />
                          </Box>

                          {isSociety && !gatekeeper.allowed && (
                            <Alert severity="error" sx={{ borderRadius: 2, mt: 1, '& .MuiAlert-icon': { color: '#ff3366' }, bgcolor: 'rgba(255, 51, 102, 0.1)', color: '#ff3366' }}>
                              <Typography variant="body2" sx={{ fontWeight: 700 }}>Rank 4 Required</Typography>
                              Only authenticated Rank 4 members can broadcast to the Society.
                            </Alert>
                          )}
                        </>
                      )}

                      {/* --- BLOCK 2: EVENT TYPE --- */}
                      {b.id === 'type' && (
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 1.5 }}>
                          <CardChoice 
                            title="Article Draft" desc="Schedule a written report" color={color} 
                            selected={eventType === 'article'} onClick={() => setEventType('article')}
                          />
                          <CardChoice 
                            title="Livestream Draft" desc="Schedule a live session" color={color} 
                            selected={eventType === 'livestream'} onClick={() => setEventType('livestream')}
                          />
                          {!isSociety && (
                            <CardChoice 
                              title="General Event" desc="Standard text reminder" color={color} 
                              selected={eventType === 'general'} onClick={() => setEventType('general')}
                            />
                          )}
                        </Box>
                      )}

                      {b.id === 'taxonomy' && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                          {!gatekeeper.allowed && (
                            <Alert severity="warning" sx={{ mb: 1 }}>
                              You must be Level 4+ to post Society-wide events.
                            </Alert>
                          )}
                          <PremiumAutocomplete
                            label="Mission Category"
                            options={categories}
                            getOptionLabel={(opt) => opt.title}
                            value={challengeId}
                            onChange={(e, val) => {
                              setChallengeId(val);
                              setSubcategoryId('');
                            }}
                            colorTheme={color}
                          />
                          <PremiumAutocomplete
                            label="Subcategory / Focus"
                            options={challengeId ? challengeId.subcategories : []}
                            getOptionLabel={(opt) => opt.title}
                            value={challengeId?.subcategories?.find((s: any) => s.id === subcategoryId) || null}
                            onChange={(e, val) => setSubcategoryId(val ? val.id : '')}
                            colorTheme={color}
                            disabled={!challengeId}
                          />
                          <PremiumAutocomplete
                            label="Era"
                            options={ERAS}
                            getOptionLabel={(opt) => opt.label}
                            value={ERAS.find(e => e.id === eraId) || null}
                            onChange={(e, val) => setEraId(val ? val.id : '')}
                            colorTheme={color}
                          />
                        </Box>
                      )}

                      {/* --- BLOCK 3: DETAILS --- */}
                      {b.id === 'details' && (
                        <>
                          <PremiumTextField 
                            label="Event Title" placeholder="e.g. Q3 Roadmap Review" 
                            fullWidth size="small" value={title} onChange={(e: any) => setTitle(e.target.value)} colorTheme={color}
                          />

                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography sx={{ fontWeight: 800, color: '#334155', fontSize: '0.85rem' }}>Timing Intent</Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: 'text.secondary' }}>All Day</Typography>
                                <PremiumSwitch 
                                  checked={isAllDay} 
                                  onChange={(e) => setIsAllDay(e.target.checked)} 
                                  size="small"
                                  colorTheme={color}
                                />
                              </Box>
                            </Box>
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                              <CardChoice 
                                title="Start Date" desc="Specific time block" color={color} 
                                selected={dateType === 'START_TIME'} onClick={() => setDateType('START_TIME')}
                              />
                              <CardChoice 
                                title="Deadline" desc="Cut-off or due date" color={color} 
                                selected={dateType === 'DEADLINE'} onClick={() => setDateType('DEADLINE')}
                              />
                              <CardChoice 
                                title="Publish Date" desc="When content goes live" color={color} 
                                selected={dateType === 'PUBLISH_DATE'} onClick={() => setDateType('PUBLISH_DATE')}
                              />
                              <CardChoice 
                                title="Date Range" desc="Multi-day event" color={color} 
                                selected={dateType === 'DATE_RANGE'} onClick={() => setDateType('DATE_RANGE')}
                              />
                            </Box>
                          </Box>

                          <Box sx={{ display: 'flex', gap: 2 }}>
                            <Box sx={{ flex: 1 }}>
                              <PremiumDatePicker 
                                label={dateType === 'PUBLISH_DATE' ? "Publish Date" : (dateType === 'DEADLINE' ? "Deadline Date" : (dateType === 'DATE_RANGE' ? "Start Date" : "Start Date"))} 
                                value={date} 
                                onChange={(e: any) => {
                                  setDate(e.target.value);
                                  if (onDateChange && e.target.value) {
                                    // Parse as local date to prevent timezone shift
                                    const parsedDate = new Date(e.target.value.replace(/-/g, '/'));
                                    if (!isNaN(parsedDate.getTime())) onDateChange(parsedDate);
                                  }
                                }} 
                                colorTheme={color}
                              />
                            </Box>
                            {!isAllDay && (
                              <Box sx={{ flex: 1 }}>
                                <PremiumTimePicker 
                                  label="Time" 
                                  value={time} 
                                  onChange={(e: any) => setTime(e.target.value)} 
                                  colorTheme={color}
                                />
                              </Box>
                            )}
                          </Box>

                          {(dateType === 'DATE_RANGE' || dateType === 'START_TIME') && (
                            <Box sx={{ display: 'flex', gap: 2 }}>
                              <Box sx={{ flex: 1 }}>
                                <PremiumDatePicker 
                                  label="End Date (Optional)" 
                                  value={endDate} 
                                  onChange={(e: any) => setEndDate(e.target.value)} 
                                  colorTheme={color}
                                />
                              </Box>
                              {!isAllDay && (
                                <Box sx={{ flex: 1 }}>
                                  <PremiumTimePicker 
                                    label="End Time (Optional)" 
                                    value={endTime} 
                                    onChange={(e: any) => setEndTime(e.target.value)} 
                                    colorTheme={color}
                                  />
                                </Box>
                              )}
                            </Box>
                          )}

                          {/* Content AND Todo List */}
                          <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <PremiumTextField 
                              label="Description / Context" multiline rows={2} fullWidth size="small"
                              value={description} onChange={(e: any) => setDescription(e.target.value)} colorTheme={color}
                            />
                            
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                              <Typography sx={{ fontWeight: 800, color: '#334155', fontSize: '0.85rem' }}>Action List (Optional)</Typography>
                              {todoItems.map((todo, idx) => (
                                <Box key={todo.id} sx={{ 
                                  display: 'flex', alignItems: 'flex-start', gap: 1.5, p: 1.5,
                                  bgcolor: 'rgba(255,255,255,0.6)', borderRadius: '16px',
                                  border: '1px solid rgba(0,0,0,0.04)',
                                  boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
                                }}>
                                  <Box sx={{ width: 18, height: 18, mt: 1.2, borderRadius: '6px', border: `2px solid ${alpha(color, 0.4)}`, flexShrink: 0, bgcolor: 'rgba(255,255,255,0.8)' }} />
                                  <PremiumTextField 
                                    label={`Task ${idx + 1}`} fullWidth size="small"
                                    value={todo.text} onChange={(e: any) => updateTodo(todo.id, e.target.value)} colorTheme={color}
                                  />
                                  <IconButton size="small" onClick={() => removeTodo(todo.id)} sx={{ color: '#ef4444', mt: 0.5, bgcolor: 'rgba(239,68,68,0.1)', '&:hover': { bgcolor: 'rgba(239,68,68,0.2)' } }}>
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                              ))}
                              <Button startIcon={<AddIcon />} size="small" onClick={handleAddTodo} sx={{ color, fontWeight: 800, alignSelf: 'flex-start', bgcolor: alpha(color, 0.1), borderRadius: '10px', px: 2, '&:hover': { bgcolor: alpha(color, 0.2) } }}>
                                Add Task
                              </Button>
                            </Box>
                          </Box>

                          {/* Tags for Organization or Personal */}
                          {(!isSociety) && (
                            <Box sx={{ mt: 1 }}>
                              <Typography sx={{ fontWeight: 800, color: '#334155', fontSize: '0.85rem', mb: 1 }}>Keywords / Tags (Optional)</Typography>
                              <PremiumAutocomplete
                                multiple
                                freeSolo
                                label="Press Enter to add tags"
                                options={[]}
                                value={tags}
                                onChange={(e, val) => setTags(val as string[])}
                                colorTheme={color}
                              />
                            </Box>
                          )}
                        </>
                      )}
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
