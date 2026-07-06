// @ts-nocheck
"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  alpha,
  TextField,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import { ArrowBack as ArrowBackIcon, ArrowForward as ArrowForwardIcon, RocketLaunch as RocketLaunchIcon } from "@mui/icons-material";

const PINK = "#ec4899";
const PINK_DARK = "#db2777";
const GREEN = "#10b981";

const glassCard = {
  bgcolor: "rgba(255, 255, 255, 0.03)",
  backdropFilter: "blur(20px)",
  border: "1px solid rgba(0, 0, 0, 0.08)",
  borderRadius: "20px",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.04)",
};

const STEPS = ["Basics", "Details", "Goal", "Review"];

export default function LaunchCampaignForm({ onCancel }: { onCancel: () => void }) {
  const [activeStep, setActiveStep] = useState(0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [goal, setGoal] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleNext = () => {
    if (activeStep === STEPS.length - 1) {
      setSubmitted(true);
      setTimeout(() => onCancel(), 2000);
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const canProceed = () => {
    if (activeStep === 0) return title.length > 3;
    if (activeStep === 1) return description.length > 10;
    if (activeStep === 2) return goal.length > 0;
    return true;
  };

  if (submitted) {
    return (
      <Paper
        elevation={0}
        sx={{
          flex: 1,
          m: { xs: 1, md: 2 },
          minHeight: 0,
          height: { xs: 'calc(100% - 16px)', md: 'calc(100% - 32px)' },
          bgcolor: '#ffffff',
          borderRadius: 4,
          boxShadow: { xs: '0 8px 32px rgba(0,0,0,0.06)', md: '0 10px 40px rgba(0,0,0,0.04)' },
          overflowY: 'auto',
          overflowX: 'hidden',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4,
        }}
      >
        <RocketLaunchIcon sx={{ fontSize: 64, color: GREEN, mb: 2 }} />
        <Typography variant="h5" sx={{ fontWeight: 900, mb: 2 }}>
          Campaign Launched!
        </Typography>
        <Typography color="text.secondary">
          Returning to the support hub...
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        flex: 1,
        m: { xs: 1, md: 2 },
        minHeight: 0,
        height: { xs: 'calc(100% - 16px)', md: 'calc(100% - 32px)' },
        bgcolor: '#ffffff',
        borderRadius: 4,
        boxShadow: { xs: '0 8px 32px rgba(0,0,0,0.06)', md: '0 10px 40px rgba(0,0,0,0.04)' },
        overflowY: 'auto',
        overflowX: 'hidden',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 640, mx: "auto", width: "100%" }}>
        <Button startIcon={<ArrowBackIcon />} onClick={onCancel} sx={{ mb: 2, color: "text.secondary", fontWeight: 700 }}>
          Cancel
        </Button>

        <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, background: `linear-gradient(135deg, ${PINK} 0%, ${PINK_DARK} 100%)`, backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Launch a Campaign
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>
          Create a funding or support initiative for your food system project.
        </Typography>

        <Paper sx={{ ...glassCard, p: 3, mb: 3 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {STEPS.map((label) => (
              <Step key={label}><StepLabel>{label}</StepLabel></Step>
            ))}
          </Stepper>
        </Paper>

        <Paper sx={{ ...glassCard, p: 4 }}>
          {activeStep === 0 && (
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>Campaign Title</Typography>
              <TextField fullWidth placeholder="E.g. Solar Cold Room for Market Women" value={title} onChange={(e) => setTitle(e.target.value)} />
            </Box>
          )}
          {activeStep === 1 && (
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>Description</Typography>
              <TextField fullWidth multiline rows={4} placeholder="Tell the community why this matters..." value={description} onChange={(e) => setDescription(e.target.value)} />
            </Box>
          )}
          {activeStep === 2 && (
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>Funding Goal (₦)</Typography>
              <TextField fullWidth placeholder="250000" type="number" value={goal} onChange={(e) => setGoal(e.target.value)} />
            </Box>
          )}
          {activeStep === 3 && (
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>Review Your Campaign</Typography>
              <Typography sx={{ fontWeight: 700 }}>Title:</Typography> <Typography mb={2}>{title}</Typography>
              <Typography sx={{ fontWeight: 700 }}>Description:</Typography> <Typography mb={2}>{description}</Typography>
              <Typography sx={{ fontWeight: 700 }}>Goal:</Typography> <Typography>₦{goal}</Typography>
            </Box>
          )}
        </Paper>

        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
          <Button disabled={activeStep === 0} onClick={handleBack} sx={{ color: "text.secondary", fontWeight: 700 }}>Back</Button>
          <Button variant="contained" onClick={handleNext} disabled={!canProceed()} sx={{ bgcolor: activeStep === STEPS.length - 1 ? GREEN : PINK, "&:hover": { bgcolor: activeStep === STEPS.length - 1 ? "#059669" : PINK_DARK } }}>
            {activeStep === STEPS.length - 1 ? "Launch Campaign" : "Continue"}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}
