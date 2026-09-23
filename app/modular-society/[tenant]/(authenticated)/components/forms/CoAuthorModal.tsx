'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, TextField, Button, Chip, Avatar,
  IconButton, Tooltip, Tabs, Tab, CircularProgress,
  Paper, alpha, InputAdornment, Divider, Alert
} from '@mui/material';
import {
  Close as CloseIcon,
  Search as SearchIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  PersonAdd as PersonAddIcon,
  ContentCopy as ContentCopyIcon,
  Check as CheckIcon,
  Star as StarIcon,
  Mail as MailIcon,
  Verified as VerifiedIcon,
  ArrowForward as ArrowForwardIcon,
  DeleteOutlined as DeleteIcon,
  Upgrade as UpgradeIcon,
  Link as LinkIcon,
  Send as SendIcon
} from '@mui/icons-material';
import { getPotentialCoAuthors, inviteCoAuthorAction } from '@/lib/actions/learn';

export interface CollaboratorItem {
  uid?: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: string;
  rank?: number;
  isOrg?: boolean;
  status?: 'invited' | 'confirmed';
  timestamp?: string;
  upgradePrompt?: boolean;
}

interface CoAuthorModalProps {
  open: boolean;
  onClose: () => void;
  draftId?: string | null;
  articleTitle?: string;
  collaborators: CollaboratorItem[];
  onUpdateCollaborators: (collabs: CollaboratorItem[]) => void;
  currentUserId?: string;
  currentUserName?: string;
  themeColor?: string;
  tenant?: string;
}

export function CoAuthorModal({
  open,
  onClose,
  draftId,
  articleTitle,
  collaborators,
  onUpdateCollaborators,
  currentUserId,
  currentUserName,
  themeColor = '#f59e0b',
  tenant = 'society',
}: CoAuthorModalProps) {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingDirectory, setLoadingDirectory] = useState(false);
  const [directoryMembers, setDirectoryMembers] = useState<any[]>([]);
  const [directoryOrgs, setDirectoryOrgs] = useState<any[]>([]);
  const [copiedLink, setCopiedLink] = useState(false);
  const [sendingInvite, setSendingInvite] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info', message: string } | null>(null);

  // Email form state
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [roleInput, setRoleInput] = useState('Co-Author');
  const [noteInput, setNoteInput] = useState('');

  // Fetch directory when modal opens
  useEffect(() => {
    if (open) {
      loadDirectory();
    }
  }, [open]);

  const loadDirectory = async (query?: string) => {
    setLoadingDirectory(true);
    try {
      const res = await getPotentialCoAuthors(query);
      if (res.success) {
        setDirectoryMembers(res.members || []);
        setDirectoryOrgs(res.organizations || []);
      }
    } catch (e: any) {
      console.error('Failed to load co-authors:', e);
    } finally {
      setLoadingDirectory(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    loadDirectory(val);
  };

  // Build collaboration invite URL
  const collaborationUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    const base = window.location.origin;
    const targetDraft = draftId || 'new';
    return `${base}/modular-society/${tenant}/learn?draftId=${targetDraft}&invite=true`;
  }, [tenant, draftId]);

  const handleCopyLink = () => {
    if (collaborationUrl) {
      navigator.clipboard.writeText(collaborationUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Check if someone is already in collaborators
  const isAlreadyCollaborator = (email?: string, uid?: string) => {
    return collaborators.some(c => 
      (email && c.email?.toLowerCase() === email.toLowerCase()) ||
      (uid && c.uid === uid)
    );
  };

  // Add Rank 4+ member or organization
  const handleInviteEntity = async (entity: any, upgradePrompt = false) => {
    setSendingInvite(true);
    setNotification(null);
    try {
      const newCollab: CollaboratorItem = {
        uid: entity.uid || entity.id,
        name: entity.name,
        email: entity.email || `${entity.slug || entity.name.toLowerCase().replace(/\s+/g, '')}@foodnerve.org`,
        avatarUrl: entity.avatarUrl || entity.logoUrl,
        role: upgradePrompt ? 'Invited Collaborator' : 'Co-Author',
        rank: entity.rank || 1,
        isOrg: !!entity.isOrg,
        status: 'invited',
        timestamp: new Date().toISOString(),
        upgradePrompt
      };

      const res = await inviteCoAuthorAction({
        draftId: draftId || undefined,
        collaborator: newCollab,
        inviterName: currentUserName,
        articleTitle
      });

      if (res.success) {
        onUpdateCollaborators([...collaborators, newCollab]);
        setNotification({
          type: 'success',
          message: upgradePrompt
            ? `Upgrade prompt sent to ${entity.name}. They will receive instructions to upgrade and co-author.`
            : `Invitation sent to ${entity.name}. Added as co-author!`
        });
      } else {
        setNotification({ type: 'error', message: res.error || 'Failed to send invite' });
      }
    } catch (e: any) {
      setNotification({ type: 'error', message: e.message || 'Error sending invite' });
    } finally {
      setSendingInvite(false);
    }
  };

  // Handle external email invitation
  const handleSendEmailInvite = async () => {
    if (!emailInput.trim()) {
      setNotification({ type: 'error', message: 'Please enter a valid email address' });
      return;
    }
    setSendingInvite(true);
    setNotification(null);
    try {
      const email = emailInput.trim();
      const name = nameInput.trim() || email.split('@')[0];

      const newCollab: CollaboratorItem = {
        name,
        email,
        role: roleInput || 'Co-Author',
        status: 'invited',
        timestamp: new Date().toISOString(),
        isOrg: false
      };

      const res = await inviteCoAuthorAction({
        draftId: draftId || undefined,
        collaborator: newCollab,
        inviterName: currentUserName,
        articleTitle
      });

      if (res.success) {
        onUpdateCollaborators([...collaborators, newCollab]);
        setNotification({
          type: 'success',
          message: `Co-author invitation sent to ${email} with collaboration link!`
        });
        setEmailInput('');
        setNameInput('');
        setNoteInput('');
      } else {
        setNotification({ type: 'error', message: res.error || 'Failed to send email invite' });
      }
    } catch (e: any) {
      setNotification({ type: 'error', message: e.message || 'Error inviting collaborator' });
    } finally {
      setSendingInvite(false);
    }
  };

  // Remove collaborator
  const handleRemoveCollaborator = (index: number) => {
    const updated = collaborators.filter((_, i) => i !== index);
    onUpdateCollaborators(updated);
  };

  // Filter lists for Tab 0 (Rank 4+ Directory) and Tab 1 (Lower Rank Members)
  const rank4PlusMembers = useMemo(() => {
    return directoryMembers.filter(m => (m.rank ?? 0) >= 4 && m.uid !== currentUserId);
  }, [directoryMembers, currentUserId]);

  const rank4PlusOrgs = useMemo(() => {
    return directoryOrgs.filter(o => (o.rank ?? 0) >= 4);
  }, [directoryOrgs]);

  const lowerRankMembers = useMemo(() => {
    return directoryMembers.filter(m => (m.rank ?? 0) < 4 && m.uid !== currentUserId);
  }, [directoryMembers, currentUserId]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      sx={{
        backdropFilter: 'blur(16px)',
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        '& .MuiDialog-paper': {
          borderRadius: '24px',
          bgcolor: '#ffffff',
          boxShadow: '0 25px 60px rgba(15, 23, 42, 0.25)',
          overflow: 'hidden',
          border: '1px solid rgba(0,0,0,0.08)'
        }
      }}
    >
      {/* ─── MODAL HEADER ─── */}
      <DialogTitle sx={{ p: 3, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{
            width: 44, height: 44, borderRadius: '14px',
            bgcolor: alpha(themeColor, 0.12),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: themeColor
          }}>
            <PeopleIcon sx={{ fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 900, color: '#0f172a', lineHeight: 1.2 }}>
              Co-Authors & Editorial Collaborators
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
              Invite verified Rank 4+ members, organizations, or external co-authors to co-create this article
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: '#64748b' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        
        {notification && (
          <Alert severity={notification.type} onClose={() => setNotification(null)} sx={{ borderRadius: '12px' }}>
            {notification.message}
          </Alert>
        )}

        {/* ─── ACTIVE COLLABORATORS ROW ─── */}
        <Paper elevation={0} sx={{
          p: 2, borderRadius: '16px', bgcolor: '#f8fafc',
          border: '1px solid rgba(0,0,0,0.06)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Current Co-Authors ({collaborators.length})
            </Typography>
            {collaborators.length > 0 && (
              <Chip label="Changes Auto-Synced" size="small" sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#059669', fontWeight: 700, fontSize: '0.7rem' }} />
            )}
          </Box>

          {collaborators.length === 0 ? (
            <Typography sx={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic', py: 1 }}>
              No co-authors added yet. Search the directory below or share an invite link.
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
              {collaborators.map((c, idx) => (
                <Box
                  key={idx}
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 1.25,
                    p: '8px 14px', borderRadius: '12px', bgcolor: '#ffffff',
                    border: '1px solid rgba(0,0,0,0.08)',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                  }}
                >
                  <Avatar src={c.avatarUrl} sx={{ width: 30, height: 30, fontSize: '0.75rem', bgcolor: themeColor }}>
                    {c.name?.charAt(0) || 'C'}
                  </Avatar>
                  <Box>
                    <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.1 }}>
                      {c.name}
                    </Typography>
                    <Typography sx={{ fontSize: '0.7rem', color: '#64748b' }}>
                      {c.role || 'Co-Author'} {c.rank ? `• Rank ${c.rank}` : ''}
                    </Typography>
                  </Box>
                  <IconButton size="small" onClick={() => handleRemoveCollaborator(idx)} sx={{ color: '#94a3b8', '&:hover': { color: '#ef4444' } }}>
                    <DeleteIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Box>
              ))}
            </Box>
          )}
        </Paper>

        {/* ─── SHAREABLE COLLABORATION LINK ─── */}
        <Box sx={{
          p: 2, borderRadius: '16px', bgcolor: alpha(themeColor, 0.05),
          border: `1.5px dashed ${alpha(themeColor, 0.35)}`,
          display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { sm: 'center' },
          justifyContent: 'space-between', gap: 1.5
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <LinkIcon sx={{ color: themeColor, fontSize: 22 }} />
            <Box>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>
                Quick Share Collaboration Link
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
                Anyone with this link who signs in will be added as a co-author to this draft.
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            size="small"
            onClick={handleCopyLink}
            startIcon={copiedLink ? <CheckIcon /> : <ContentCopyIcon />}
            sx={{
              bgcolor: copiedLink ? '#10b981' : themeColor,
              color: '#fff', fontWeight: 800, borderRadius: '10px',
              textTransform: 'none', px: 2, py: 0.8, flexShrink: 0,
              boxShadow: `0 4px 12px ${alpha(themeColor, 0.25)}`,
              '&:hover': { bgcolor: copiedLink ? '#059669' : alpha(themeColor, 0.85) }
            }}
          >
            {copiedLink ? 'Link Copied!' : 'Copy Invite Link'}
          </Button>
        </Box>

        {/* ─── TABS NAVIGATION ─── */}
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          sx={{
            borderBottom: '1px solid rgba(0,0,0,0.08)',
            '& .MuiTab-root': {
              fontWeight: 800, fontSize: '0.85rem', textTransform: 'none',
              color: '#64748b', '&.Mui-selected': { color: themeColor }
            },
            '& .MuiTabs-indicator': { bgcolor: themeColor, height: 3, borderRadius: '3px' }
          }}
        >
          <Tab label={`Rank 4+ Directory (${rank4PlusMembers.length + rank4PlusOrgs.length})`} />
          <Tab label={`Lower Rank Members (${lowerRankMembers.length})`} />
          <Tab label="Invite by Email" />
        </Tabs>

        {/* ─── TAB 0: RANK 4+ DIRECTORY ─── */}
        {activeTab === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              size="small"
              fullWidth
              placeholder="Search Rank 4+ members and organizations..."
              value={searchQuery}
              onChange={handleSearchChange}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#94a3b8', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: '12px', bgcolor: '#f8fafc' }
                }
              }}
            />

            {loadingDirectory ? (
              <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress size={32} sx={{ color: themeColor }} />
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, maxHeight: 360, overflowY: 'auto', pr: 0.5 }}>
                
                {/* Organizations Section */}
                {rank4PlusOrgs.length > 0 && (
                  <Box>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1 }}>
                      Rank 4+ Organizations
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {rank4PlusOrgs.map(org => {
                        const alreadyAdded = isAlreadyCollaborator(undefined, org.id);
                        return (
                          <Box
                            key={org.id}
                            sx={{
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              p: 1.5, px: 2, borderRadius: '14px', bgcolor: '#fff',
                              border: '1px solid rgba(0,0,0,0.06)',
                              boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                              '&:hover': { bgcolor: '#f8fafc', borderColor: alpha(themeColor, 0.3) },
                              transition: 'all 0.15s'
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Avatar src={org.logoUrl} sx={{ width: 38, height: 38, borderRadius: '10px', bgcolor: 'rgba(59, 130, 246, 0.1)' }}>
                                <BusinessIcon sx={{ color: '#3b82f6', fontSize: 20 }} />
                              </Avatar>
                              <Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                  <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>
                                    {org.name}
                                  </Typography>
                                  {org.verified && <VerifiedIcon sx={{ fontSize: 16, color: '#3b82f6' }} />}
                                </Box>
                                <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
                                  Verified Organization • Rank {org.rank}
                                </Typography>
                              </Box>
                            </Box>

                            <Button
                              size="small"
                              variant={alreadyAdded ? 'outlined' : 'contained'}
                              disabled={alreadyAdded || sendingInvite}
                              onClick={() => handleInviteEntity(org)}
                              startIcon={alreadyAdded ? <CheckIcon /> : <PersonAddIcon />}
                              sx={{
                                borderRadius: '10px', textTransform: 'none', fontWeight: 800,
                                fontSize: '0.78rem', px: 2,
                                bgcolor: alreadyAdded ? 'transparent' : themeColor,
                                color: alreadyAdded ? '#10b981' : '#fff',
                                borderColor: alreadyAdded ? '#10b981' : 'transparent',
                                '&:hover': { bgcolor: alreadyAdded ? 'rgba(16,185,129,0.05)' : alpha(themeColor, 0.9) }
                              }}
                            >
                              {alreadyAdded ? 'Added' : 'Invite Org'}
                            </Button>
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>
                )}

                {/* Members Section */}
                {rank4PlusMembers.length > 0 && (
                  <Box>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1 }}>
                      Rank 4+ Verified Members
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {rank4PlusMembers.map(member => {
                        const alreadyAdded = isAlreadyCollaborator(member.email, member.uid);
                        return (
                          <Box
                            key={member.id}
                            sx={{
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              p: 1.5, px: 2, borderRadius: '14px', bgcolor: '#fff',
                              border: '1px solid rgba(0,0,0,0.06)',
                              boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                              '&:hover': { bgcolor: '#f8fafc', borderColor: alpha(themeColor, 0.3) },
                              transition: 'all 0.15s'
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Avatar src={member.avatarUrl} sx={{ width: 38, height: 38 }}>
                                {member.name?.charAt(0)}
                              </Avatar>
                              <Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                  <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>
                                    {member.name}
                                  </Typography>
                                  <Chip
                                    icon={<StarIcon sx={{ fontSize: '13px !important', color: '#f59e0b' }} />}
                                    label={`Rank ${member.rank}`}
                                    size="small"
                                    sx={{
                                      height: 20, fontSize: '0.68rem', fontWeight: 800,
                                      bgcolor: 'rgba(245, 158, 11, 0.1)', color: '#d97706'
                                    }}
                                  />
                                </Box>
                                <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
                                  {member.role || 'Member'} {member.email ? `• ${member.email}` : ''}
                                </Typography>
                              </Box>
                            </Box>

                            <Button
                              size="small"
                              variant={alreadyAdded ? 'outlined' : 'contained'}
                              disabled={alreadyAdded || sendingInvite}
                              onClick={() => handleInviteEntity(member)}
                              startIcon={alreadyAdded ? <CheckIcon /> : <PersonAddIcon />}
                              sx={{
                                borderRadius: '10px', textTransform: 'none', fontWeight: 800,
                                fontSize: '0.78rem', px: 2,
                                bgcolor: alreadyAdded ? 'transparent' : themeColor,
                                color: alreadyAdded ? '#10b981' : '#fff',
                                borderColor: alreadyAdded ? '#10b981' : 'transparent',
                                '&:hover': { bgcolor: alreadyAdded ? 'rgba(16,185,129,0.05)' : alpha(themeColor, 0.9) }
                              }}
                            >
                              {alreadyAdded ? 'Added' : 'Invite to Write'}
                            </Button>
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>
                )}

                {rank4PlusMembers.length === 0 && rank4PlusOrgs.length === 0 && (
                  <Typography sx={{ color: '#94a3b8', textAlign: 'center', py: 3, fontSize: '0.88rem' }}>
                    No Rank 4+ members or organizations found matching "{searchQuery}".
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        )}

        {/* ─── TAB 1: LOWER RANK MEMBERS (< RANK 4) ─── */}
        {activeTab === 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ p: 2, borderRadius: '14px', bgcolor: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
              <Typography sx={{ fontSize: '0.84rem', fontWeight: 700, color: '#1d4ed8', mb: 0.5 }}>
                💡 Co-Authorship Rank Policy
              </Typography>
              <Typography sx={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.45 }}>
                Articles published in the FoodNerve ecosystem require Rank 4+ editorial authorization. You can invite lower rank members (Rank 1–3) to co-author, which will send them an invitation along with a prompt to upgrade or verify their rank to unlock full co-author publishing privileges.
              </Typography>
            </Box>

            <TextField
              size="small"
              fullWidth
              placeholder="Search lower rank members..."
              value={searchQuery}
              onChange={handleSearchChange}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#94a3b8', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: '12px', bgcolor: '#f8fafc' }
                }
              }}
            />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxHeight: 320, overflowY: 'auto' }}>
              {lowerRankMembers.map(member => {
                const alreadyAdded = isAlreadyCollaborator(member.email, member.uid);
                return (
                  <Box
                    key={member.id}
                    sx={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      p: 1.5, px: 2, borderRadius: '14px', bgcolor: '#fff',
                      border: '1px solid rgba(0,0,0,0.06)',
                      '&:hover': { bgcolor: '#f8fafc' }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar src={member.avatarUrl} sx={{ width: 36, height: 36 }}>
                        {member.name?.charAt(0)}
                      </Avatar>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          <Typography sx={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f172a' }}>
                            {member.name}
                          </Typography>
                          <Chip
                            label={`Rank ${member.rank || 1}`}
                            size="small"
                            sx={{ height: 18, fontSize: '0.65rem', fontWeight: 800, bgcolor: 'rgba(0,0,0,0.06)', color: '#64748b' }}
                          />
                        </Box>
                        <Typography sx={{ fontSize: '0.72rem', color: '#64748b' }}>
                          {member.email}
                        </Typography>
                      </Box>
                    </Box>

                    <Button
                      size="small"
                      variant="outlined"
                      disabled={alreadyAdded || sendingInvite}
                      onClick={() => handleInviteEntity(member, true)}
                      startIcon={<UpgradeIcon />}
                      sx={{
                        borderRadius: '10px', textTransform: 'none', fontWeight: 800,
                        fontSize: '0.74rem', px: 1.75,
                        borderColor: '#3b82f6', color: '#2563eb',
                        '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.08)', borderColor: '#2563eb' }
                      }}
                    >
                      {alreadyAdded ? 'Invited' : 'Invite & Upgrade Prompt'}
                    </Button>
                  </Box>
                );
              })}

              {lowerRankMembers.length === 0 && (
                <Typography sx={{ color: '#94a3b8', textAlign: 'center', py: 3, fontSize: '0.88rem' }}>
                  No members found.
                </Typography>
              )}
            </Box>
          </Box>
        )}

        {/* ─── TAB 2: INVITE VIA EMAIL ─── */}
        {activeTab === 2 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography sx={{ fontSize: '0.85rem', color: '#64748b' }}>
              Invite external industry specialists, researchers, or institutional co-authors directly by entering their email address.
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1.2fr 1fr' }, gap: 1.5 }}>
              <TextField
                size="small"
                label="Email Address *"
                placeholder="colleague@institution.org"
                value={emailInput}
                onChange={e => setEmailInput(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <MailIcon sx={{ color: '#94a3b8', fontSize: 18 }} />
                      </InputAdornment>
                    )
                  }
                }}
              />
              <TextField
                size="small"
                label="Full Name (Optional)"
                placeholder="Dr. Jane Doe"
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
              />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
              <TextField
                size="small"
                label="Editorial Role"
                value={roleInput}
                onChange={e => setRoleInput(e.target.value)}
                helperText="e.g. Co-Author, Technical Reviewer, Contributing Analyst"
              />
              <TextField
                size="small"
                label="Personal Note (Optional)"
                placeholder="Join me in co-authoring this brief..."
                value={noteInput}
                onChange={e => setNoteInput(e.target.value)}
              />
            </Box>

            <Button
              variant="contained"
              onClick={handleSendEmailInvite}
              disabled={sendingInvite || !emailInput.trim()}
              startIcon={<SendIcon />}
              sx={{
                bgcolor: themeColor, color: '#fff', fontWeight: 800,
                borderRadius: '12px', py: 1.25, textTransform: 'none',
                boxShadow: `0 6px 18px ${alpha(themeColor, 0.3)}`,
                alignSelf: 'flex-start', px: 3,
                '&:hover': { bgcolor: alpha(themeColor, 0.9) }
              }}
            >
              {sendingInvite ? 'Sending Invitation...' : 'Send Email Invitation'}
            </Button>
          </Box>
        )}

      </DialogContent>

      <DialogActions sx={{ p: 2.5, px: 3, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
        <Button
          onClick={onClose}
          sx={{
            fontWeight: 800, color: '#64748b', textTransform: 'none', px: 3,
            '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' }
          }}
        >
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
}
