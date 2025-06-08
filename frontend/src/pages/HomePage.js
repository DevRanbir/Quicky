import React from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Fade,
  Button,
  Stack,
  Chip,
  Divider,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  YouTube as YouTubeIcon,
  TextFields as TextFieldsIcon,
  Quiz as QuizIcon,
  Download as DownloadIcon,
  GetApp as GetAppIcon,
  Assessment as AssessmentIcon,
  AutoAwesome as AutoAwesomeIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  Image as ImageIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <AutoAwesomeIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'AI-Powered Quiz Generation',
      description: 'Generate intelligent quiz questions automatically from your content using advanced AI technology.',
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Quick & Easy',
      description: 'Upload your content and get quiz questions in seconds. No manual question creation needed.',
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Secure & Private',
      description: 'Your content is processed securely and stored safely. Focus on learning without privacy concerns.',
    },
  ];

  const supportedFormats = [
    { extension: 'PDF', description: 'Documents, research papers, textbooks' },
    { extension: 'DOCX', description: 'Word documents, essays, notes' },
    { extension: 'PPTX', description: 'Presentations, slides, lectures' },
    { extension: 'TXT', description: 'Plain text, articles, notes' },
    { extension: 'Yt link', description: 'Any YouTube Video link not LiveStreams' },

  ];

  const exportOptions = [
    { format: 'PDF', description: 'Professional printable format' },
    { format: 'JSON', description: 'Structured data for developers' },
    { format: 'Word', description: 'Editable document format' },
    { format: 'CSV(soon)', description: 'Spreadsheet compatible format' },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      {/* Hero Section */}
      <Fade in timeout={800}>
        <Box textAlign="center" sx={{ mb: 8 }}>
          <Typography 
            variant="h2" 
            component="h1" 
            gutterBottom
            sx={{ 
              background: 'linear-gradient(45deg, #FF6B35, #FF8A65)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 700,
              mb: 2,
            }}
          >
            Smart Quiz Generator
          </Typography>
          <Typography 
            variant="h5" 
            color="text.secondary" 
            sx={{ 
              maxWidth: 600, 
              mx: 'auto', 
              mb: 4,
              lineHeight: 1.6,
            }}
          >
            Transform any content into interactive quiz questions with AI-powered intelligence
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/upload')}
            sx={{ 
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 600,
              borderRadius: 2,
              background: 'linear-gradient(45deg, #FF6B35, #FF8A65)',
              '&:hover': {
                background: 'linear-gradient(45deg, #E64A19, #FF6B35)',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(255, 107, 53, 0.3)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Get Started
          </Button>
        </Box>
      </Fade>

      {/* Features Section */}
      <Fade in timeout={1000}>
        <Box sx={{ mb: 8 }}>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    height: '100%',
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #2D2D2D 0%, #363636 100%)',
                    border: '1px solid #404040',
                    borderRadius: 3,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 30px rgba(255, 107, 53, 0.15)',
                      borderColor: 'primary.main',
                    },
                  }}
                >
                  <Box sx={{ mb: 3 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    {feature.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Fade>

      {/* How It Works Section */}
      <Fade in timeout={1200}>
        <Paper
          elevation={0}
          sx={{
            p: 5,
            mb: 8,
            background: 'linear-gradient(135deg, #2D2D2D 0%, #363636 100%)',
            border: '1px solid #404040',
            borderRadius: 3,
          }}
        >
          <Typography 
            variant="h4" 
            textAlign="center" 
            gutterBottom
            sx={{ 
              fontWeight: 600,
              color: 'primary.main',
              mb: 4,
            }}
          >
            How It Works
          </Typography>
          
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={4}>
              <Box textAlign="center">
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: 'linear-gradient(45deg, #FF6B35, #FF8A65)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  <CloudUploadIcon sx={{ fontSize: 40, color: 'white' }} />
                </Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  1. Upload Content
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Upload files, paste YouTube links, or input text directly
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box textAlign="center">
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: 'linear-gradient(45deg, #FF6B35, #FF8A65)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  <QuizIcon sx={{ fontSize: 40, color: 'white' }} />
                </Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  2. AI Generates Quiz
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Our AI analyzes content and creates relevant quiz questions
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box textAlign="center">
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: 'linear-gradient(45deg, #FF6B35, #FF8A65)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  <AssessmentIcon sx={{ fontSize: 40, color: 'white' }} />
                </Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  3. Practice & Export
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Take the quiz and export results in multiple formats
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Fade>

      {/* Content Sources Section */}
      <Fade in timeout={1400}>
        <Box sx={{ mb: 8 }}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  height: '100%',
                  background: 'linear-gradient(135deg, #2D2D2D 0%, #363636 100%)',
                  border: '1px solid #404040',
                  borderRadius: 3,
                }}
              >
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'primary.main', mb: 3 }}>
                  Supported Content Sources
                </Typography>
                
                <Stack spacing={3}>
                  <Box>
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                      <CloudUploadIcon color="primary" />
                      <Typography variant="h6" sx={{ fontWeight: 500 }}>
                        File Upload
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                      {supportedFormats.map((format, index) => (
                        <Chip
                          key={index}
                          label={format.extension}
                          variant="outlined"
                          size="small"
                          sx={{
                            borderColor: 'primary.main',
                            color: 'primary.main',
                            '&:hover': {
                              backgroundColor: 'rgba(255, 107, 53, 0.1)',
                            },
                          }}
                        />
                      ))}
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Maximum file size: 10MB
                    </Typography>
                  </Box>

                  <Divider sx={{ borderColor: '#404040' }} />

                  <Box>
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                      <YouTubeIcon color="primary" />
                      <Typography variant="h6" sx={{ fontWeight: 500 }}>
                        YouTube Videos
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Extract content from YouTube videos automatically for quiz generation
                    </Typography>
                  </Box>

                  <Divider sx={{ borderColor: '#404040' }} />

                  <Box>
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                      <TextFieldsIcon color="primary" />
                      <Typography variant="h6" sx={{ fontWeight: 500 }}>
                        Weave Textual Magic 
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Paste text directly or use generate button create content (minimum 100 words for quality quiz generation)
                    </Typography>
                  </Box>
                
                  <Divider sx={{ borderColor: '#404040' }} />

                  <Box>
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                      <ImageIcon color="primary" />
                      <Typography variant="h6" sx={{ fontWeight: 500 }}>
                        Images
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Extract content from images automatically for quiz generation
                    </Typography>
                  </Box>

                </Stack>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  height: '100%',
                  background: 'linear-gradient(135deg, #2D2D2D 0%, #363636 100%)',
                  border: '1px solid #404040',
                  borderRadius: 3,
                }}
              >
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'primary.main', mb: 3 }}>
                  Export & Download Options
                </Typography>
                
                <Stack spacing={3}>
                  {exportOptions.map((option, index) => (
                    <Box key={index}>
                      <Box display="flex" alignItems="center" gap={2} mb={1}>
                        <DownloadIcon color="primary" fontSize="small" />
                        <Typography variant="h6" sx={{ fontWeight: 500, fontSize: '1rem' }}>
                          {option.format}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                        {option.description}
                      </Typography>
                    </Box>
                  ))}
                </Stack>

                <Box 
                  sx={{ 
                    mt: 4, 
                    p: 3, 
                    borderRadius: 2, 
                    backgroundColor: 'rgba(255, 107, 53, 0.1)',
                    border: '1px solid rgba(255, 107, 53, 0.3)',
                  }}
                >
                  <Box display="flex" alignItems="center" gap={2} mb={1}>
                    <GetAppIcon color="primary" />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Complete Quiz Results
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Export your quiz questions, answers, and performance analytics in your preferred format
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Fade>

      {/* Call to Action */}
      <Fade in timeout={1600}>
        <Paper
          elevation={0}
          sx={{
            p: 5,
            textAlign: 'center',
            background: 'linear-gradient(135deg, #FF6B35 0%, #FF8A65 100%)',
            borderRadius: 3,
            color: 'white',
          }}
        >
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
            Ready to Create Your First Quiz?
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
            Upload your content and let AI do the heavy lifting
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/upload')}
              sx={{
                backgroundColor: 'white',
                color: 'primary.main',
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Start Creating
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/saved-files')}
              sx={{
                borderColor: 'white',
                color: 'white',
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderColor: 'white',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              View Saved Files
            </Button>
          </Stack>
        </Paper>
      </Fade>
    </Container>
  );
};

export default HomePage;
