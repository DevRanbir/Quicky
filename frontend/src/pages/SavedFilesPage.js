import React, { useState, useEffect, useMemo, useCallback} from 'react';
import axios from 'axios'; // Assuming you'll replace mock with actual axios
import {
  Container,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Slider,
  Grid,
  Tooltip,
  Chip,
  Card,
  CardContent,
  IconButton,
  Stack,
  Avatar,
  Fade,
  Zoom,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  GlobalStyles
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Quiz as QuizIcon,
  PictureAsPdf as PictureAsPdfIcon,
  Description as DescriptionIcon,
  Slideshow as SlideshowIcon,
  YouTube as YouTubeIcon,
  AccessTime as AccessTimeIcon,
  Pages as PagesIcon,
  Visibility as VisibilityIcon,
  Article as ArticleIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import ReplayIcon from '@mui/icons-material/Replay';

// Mock axios for demo if not using real backend
// const axios = { /* ... mock implementation ... */ };

const scrollbarStyles = (
  <GlobalStyles
    styles={{
      '*::-webkit-scrollbar': {
        width: '8px',
        height: '8px',
      },
      '*::-webkit-scrollbar-track': {
        background: '#363636',
        borderRadius: '4px',
      },
      '*::-webkit-scrollbar-thumb': {
        background: '#FF6B35',
        borderRadius: '4px',
      },
      '*::-webkit-scrollbar-thumb:hover': {
        background: '#E64A19',
      },
      '*::-webkit-scrollbar-corner': {
        background: 'transparent',
      },
      // For Firefox
      '*': {
        scrollbarWidth: 'thin',
        scrollbarColor: '#FF6B35 #363636',
      },
    }}
  />
);

const SavedFilesPage = () => {
  // Core state
  const [sources, setSources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Preview cache and loading states
  const [previewCache, setPreviewCache] = useState(new Map());
  const [previewLoadingStates, setPreviewLoadingStates] = useState(new Set());
  const [previewContentForDialog, setPreviewContentForDialog] = useState(null); // Content for the active preview dialog
  const [isPreviewDialogLoading, setIsPreviewDialogLoading] = useState(false);

  // Search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFileTypes, setSelectedFileTypes] = useState([]);
  const [sortBy, setSortBy] = useState('newest');

  // Dialog states
  const [selectedSource, setSelectedSource] = useState(null); // For quiz config
  const [configOpen, setConfigOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [sourceToDelete, setSourceToDelete] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewSourceForDialog, setPreviewSourceForDialog] = useState(null); // Source for the active preview dialog
  const [isQuizGenerating, setIsQuizGenerating] = useState(false); // New state for quiz generation loading
  
  // Quiz configuration state
  const [pagesToGenerate, setPagesToGenerate] = useState('');
  const [questionsPerPage, setQuestionsPerPage] = useState('5');
  const [totalQuestionLimit, setTotalQuestionLimit] = useState(20);
  const [timeRange, setTimeRange] = useState('');

  // --- MODIFIED LOGIC ---
  // State to track successful quiz generations (original logic)
  const [quizGeneratedSources, setQuizGeneratedSources] = useState(() => {
    try {
      const stored = localStorage.getItem('quizGeneratedSources');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch (e) {
      console.error("Failed to load quizGeneratedSources from localStorage", e);
      return new Set();
    }
  });

  // --- NEW LOGIC ---
  // State to track if a quiz has been ATTEMPTED
  const [quizAttemptedSources, setQuizAttemptedSources] = useState(() => {
    try {
      const stored = localStorage.getItem('quizAttemptedSources');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch (e) {
      console.error("Failed to load quizAttemptedSources from localStorage", e);
      return new Set();
    }
  });

  const [savedQuizConfigs, setSavedQuizConfigs] = useState(() => {
    try {
      const stored = localStorage.getItem('savedQuizConfigs');
      return stored ? JSON.parse(stored) : {};
    } catch (e) {
      console.error("Failed to load savedQuizConfigs from localStorage", e);
      return {};
    }
  });

  // Effect for saving successfully generated quizzes
  useEffect(() => {
    try {
      localStorage.setItem('quizGeneratedSources', JSON.stringify(Array.from(quizGeneratedSources)));
    } catch (e) {
      console.error("Failed to save quizGeneratedSources to localStorage", e);
    }
  }, [quizGeneratedSources]);

  // --- NEW LOGIC ---
  // Effect for saving attempted quizzes
  useEffect(() => {
    try {
      localStorage.setItem('quizAttemptedSources', JSON.stringify(Array.from(quizAttemptedSources)));
    } catch (e) {
      console.error("Failed to save quizAttemptedSources to localStorage", e);
    }
  }, [quizAttemptedSources]);


  useEffect(() => {
    try {
      localStorage.setItem('savedQuizConfigs', JSON.stringify(savedQuizConfigs));
    } catch (e) {
      console.error("Failed to save savedQuizConfigs to localStorage", e);
    }
  }, [savedQuizConfigs]);


  const navigate = useNavigate();
  const availableFileTypes = useMemo(() => ['PDF', 'DOCX', 'PPTX', 'TXT', 'YOUTUBE'], []);


  const getSourceDisplayName = useCallback((source) => {
    if (!source) return 'Unknown Source'; // Early exit if source is null/undefined

    let name = 'Unknown Source';
    const content = previewCache.get(source.id) || {}; // Get cached preview or empty object

    if (source.file) {
      name = source.file.split('/').pop();
    } else if (source.youtube_link) {
      // Prefer title from source object itself, then preview data, then link
      name = source.title || content.title || source.youtube_link || 'Unknown Title';
    }

    try {
      name = decodeURIComponent(name);
    } catch (e) {
      // console.error('Failed to decode URI component:', name, e);
      // Keep original name if decoding fails
    }
    
    if (name.startsWith('http') && name.length > 60) {
        return `${name.substring(0, 57)}...`;
    }
    return name.length > 50 && !name.startsWith('http') ? `${name.substring(0, 47)}...` : name;
  }, [previewCache]);

  const getSourceIcon = useCallback((sourceType) => {
    const iconProps = { sx: { fontSize: 24 } };
    switch (sourceType) {
      case 'PDF': return <PictureAsPdfIcon {...iconProps} sx={{ ...iconProps.sx, color: '#F44336' }} />;
      case 'DOCX': return <DescriptionIcon {...iconProps} sx={{ ...iconProps.sx, color: '#2196F3' }} />;
      case 'PPTX': return <SlideshowIcon {...iconProps} sx={{ ...iconProps.sx, color: '#FF9800' }} />;
      case 'TXT': return <ArticleIcon {...iconProps} sx={{ ...iconProps.sx, color: '#9E9E9E' }} />;
      case 'YOUTUBE': return <YouTubeIcon {...iconProps} sx={{ ...iconProps.sx, color: '#FF0000' }} />;
      default: return <DescriptionIcon {...iconProps} />;
    }
  }, []);

  const getSourceTypeColor = useCallback((sourceType) => {
    switch (sourceType) {
      case 'PDF': return '#F44336';
      case 'DOCX': return '#2196F3';
      case 'PPTX': return '#FF9800';
      case 'TXT': return '#9E9E9E';
      case 'YOUTUBE': return '#FF0000';
      default: return '#757575';
    }
  }, []);

  const createLightweightPreview = useCallback((fullPreview, sourceType) => {
    if (!fullPreview) return null;
    
    switch (sourceType) {
      case 'PDF':
        return {
          ...fullPreview,
          pages: fullPreview.pages?.slice(0, 1).map(page => ({ 
            ...page, 
            content: page.content?.substring(0, 300) + (page.content?.length > 300 ? '...' : '')
          })) || [], // Ensure pages is an array
          isLightweight: true,
          totalPages: fullPreview.pages?.length || 0
        };
      case 'YOUTUBE':
        return {
          title: fullPreview.title || 'YouTube Video',
          thumbnail: fullPreview.thumbnail,
          duration: fullPreview.duration,
          channel: fullPreview.channel,
          transcript_text: fullPreview.transcript_text?.substring(0, 500) + (fullPreview.transcript_text?.length > 500 ? '...' : ''),
          isLightweight: true,
        };
      case 'DOCX':
      case 'PPTX':
      case 'TXT':
        return {
          ...fullPreview,
          text_content: fullPreview.text_content?.substring(0, 500) + (fullPreview.text_content?.length > 500 ? '...' : ''),
          isLightweight: true,
        };
      default:
        return { isLightweight: true, ...fullPreview }; // Return a basic lightweight structure
    }
  }, []);

  const preloadEssentialPreviews = useCallback(async (sourcesToPreload) => {
    const promises = sourcesToPreload.map(async (source) => {
      if (previewCache.has(source.id) || previewLoadingStates.has(source.id)) return;
      setPreviewLoadingStates(prev => new Set(prev).add(source.id));
      try {
        const response = await axios.get(`/sources/${source.id}/preview/`);
        const lightweightPreview = createLightweightPreview(response.data, source.source_type);
        setPreviewCache(prev => new Map(prev).set(source.id, lightweightPreview));
      } catch (err) {
        console.error(`Failed to preload preview for source ${source.id}:`, err);
      } finally {
        setPreviewLoadingStates(prev => {
          const newSet = new Set(prev);
          newSet.delete(source.id);
          return newSet;
        });
      }
    });
    await Promise.allSettled(promises);
  }, [previewCache, previewLoadingStates, createLightweightPreview]);

  const fetchFullPreview = useCallback(async (source) => {
    const fullPreviewCacheKey = `${source.id}_full`;
    if (previewCache.has(fullPreviewCacheKey)) return previewCache.get(fullPreviewCacheKey);
    
    setIsPreviewDialogLoading(true);
    try {
      const response = await axios.get(`/sources/${source.id}/preview/`);
      setPreviewCache(prev => new Map(prev).set(fullPreviewCacheKey, response.data));
      setIsPreviewDialogLoading(false);
      return response.data;
    } catch (err) {
      console.error('Full preview fetch error:', err);
      setIsPreviewDialogLoading(false);
      return null;
    }
  }, [previewCache]);

  const fetchSources = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/sources/files/');
      setSources(response.data || []);
      setError('');
      if (response.data && response.data.length > 0) {
        preloadEssentialPreviews(response.data.slice(0, 6)); // Preload first 6
      }
    } catch (err) {
      setError('Failed to fetch saved files. Please try again.');
      console.error('Fetch error:', err);
      setSources([]); // Ensure sources is an array on error
    }
    setIsLoading(false);
  }, [preloadEssentialPreviews]);

  useEffect(() => {
    fetchSources();
  }, [fetchSources]);

  const filteredSources = useMemo(() => {
    if (!Array.isArray(sources)) return [];
    let tempSources = sources.filter(source => {
      const displayName = getSourceDisplayName(source).toLowerCase();
      const type = source.source_type;
      const matchesSearch = searchQuery ? displayName.includes(searchQuery.toLowerCase()) : true;
      const matchesFileType = selectedFileTypes.length > 0 ? selectedFileTypes.includes(type) : true;
      return matchesSearch && matchesFileType;
    });

    tempSources.sort((a, b) => {
      switch (sortBy) {
        case 'newest': return new Date(b.uploaded_at) - new Date(a.uploaded_at);
        case 'oldest': return new Date(a.uploaded_at) - new Date(b.uploaded_at);
        case 'name': return getSourceDisplayName(a).localeCompare(getSourceDisplayName(b));
        case 'type': return a.source_type.localeCompare(b.source_type);
        default: return 0;
      }
    });
    return tempSources;
  }, [sources, searchQuery, selectedFileTypes, sortBy, getSourceDisplayName]);

  useEffect(() => {
    // Lazy load previews for visible items not yet cached (lightweight)
    const sourcesToLoad = filteredSources.slice(0, 12).filter(source => 
      !previewCache.has(source.id) && !previewLoadingStates.has(source.id)
    );
    if (sourcesToLoad.length > 0) {
      preloadEssentialPreviews(sourcesToLoad);
    }
  }, [filteredSources, previewCache, previewLoadingStates, preloadEssentialPreviews]);

  const handlePreviewClick = useCallback(async (source) => {
    setPreviewSourceForDialog(source);
    setPreviewOpen(true);
    setIsPreviewDialogLoading(true);

    // Try to show lightweight preview first if available
    const lightweight = previewCache.get(source.id);
    if (lightweight) {
      setPreviewContentForDialog(lightweight);
    } else {
      setPreviewContentForDialog(null); // Clear previous content
    }

    const fullPreview = await fetchFullPreview(source);
    if (fullPreview) {
      setPreviewContentForDialog(fullPreview);
    }
    // If fullPreview is null and lightweight was shown, it remains. If neither, dialog shows loading/error.
    setIsPreviewDialogLoading(false);
  }, [previewCache, fetchFullPreview]);
  
  const renderPreviewDialogContent = useCallback(() => {
    if (isPreviewDialogLoading && !previewContentForDialog) {
      return <Box textAlign="center" p={3}><CircularProgress /></Box>;
    }
    if (!previewContentForDialog && !isPreviewDialogLoading) {
      return <Typography sx={{ p: 2 }}>No preview available or failed to load.</Typography>;
    }

    const content = previewContentForDialog;
    const sourceType = previewSourceForDialog?.source_type;

    // Add a check for content itself
    if (!content) {
        return <Typography sx={{ p: 2 }}>Preview content is missing.</Typography>;
    }

    switch (sourceType) {
      case 'PDF':
        return (
          <Box sx={{ maxHeight: '70vh', overflowY: 'auto', pr: 1 /* For scrollbar */ }}>
            {content.pages && content.pages.length > 0 ? (
              content.pages.map((page, index) => (
                <Card key={index} sx={{ mb: 2, backgroundColor: '#363636' }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <PagesIcon fontSize="small" color="primary" />
                      <Typography variant="h6">Page {page.page_number || index + 1}</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {page.content || 'No content for this page.'}
                    </Typography>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Typography sx={{ p: 2 }}>No pages to display for this PDF.</Typography>
            )}
          </Box>
        );
      case 'YOUTUBE':
        return (
          <Box sx={{ maxHeight: '70vh', overflowY: 'auto', pr: 1 }}>
            {content.thumbnail && <img src={content.thumbnail} alt={content.title || 'YouTube Video'} style={{ maxWidth: '100%', height: 'auto', borderRadius: '4px', marginBottom: '16px' }} />}
            <Typography variant="h5" gutterBottom>{content.title || 'YouTube Video'}</Typography>
            {content.duration && <Typography variant="body2" color="text.secondary">Duration: {content.duration}</Typography>}
            {content.channel && <Typography variant="body2" color="text.secondary" gutterBottom>Channel: {content.channel}</Typography>}
            {content.transcript_text ? (
              <Paper elevation={2} sx={{ p: 2, mt: 2, backgroundColor: '#363636' }}>
                <Typography variant="h6" gutterBottom>Transcript</Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', maxHeight: '40vh', overflowY: 'auto' }}>
                  {content.transcript_text}
                </Typography>
              </Paper>
            ) : (
              <Typography sx={{ mt: 2 }}>No transcript available.</Typography>
            )}
          </Box>
        );
      case 'DOCX':
      case 'PPTX':
      case 'TXT':
        return (
          <Box sx={{ maxHeight: '70vh', overflowY: 'auto', pr: 1 }}>
            <Paper elevation={2} sx={{ p: 2, backgroundColor: '#363636' }}>
              <Typography variant="h6" gutterBottom>Content</Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', maxHeight: '60vh', overflowY: 'auto' }}>
                {content.text_content || 'No text content available.'}
              </Typography>
            </Paper>
          </Box>
        );
      default:
        return <Typography sx={{ p: 2 }}>Unsupported file type for preview.</Typography>;
    }
  }, [previewContentForDialog, previewSourceForDialog, isPreviewDialogLoading]);

  const handleDeleteClick = (source) => {
    setSourceToDelete(source);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!sourceToDelete) return;
    try {
      await axios.delete(`/sources/${sourceToDelete.id}/delete_file/`);
      setSources(prevSources => prevSources.filter(s => s.id !== sourceToDelete.id));
      setPreviewCache(prev => {
        const newCache = new Map(prev);
        newCache.delete(sourceToDelete.id);
        newCache.delete(`${sourceToDelete.id}_full`);
        return newCache;
      });
      // Also remove from attempted/generated lists
      setQuizAttemptedSources(prev => {
          const newSet = new Set(prev);
          newSet.delete(sourceToDelete.id);
          return newSet;
      });
      setQuizGeneratedSources(prev => {
          const newSet = new Set(prev);
          newSet.delete(sourceToDelete.id);
          return newSet;
      });
      setDeleteConfirmOpen(false);
      setSourceToDelete(null);
    } catch (err) {
      setError(`Failed to delete file: ${getSourceDisplayName(sourceToDelete)}.`);
      console.error('Delete error:', err);
    }
  };

  const handleConfigureQuiz = (source) => {
    setSelectedSource(source);
  
    const savedConfig = savedQuizConfigs[source.id];
    if (savedConfig) {
      setPagesToGenerate(savedConfig.pagesToGenerate || (source.source_type === 'PDF' && source.page_count ? `1-${source.page_count}` : ''));
      setQuestionsPerPage(savedConfig.questionsPerPage || '5');
      setTotalQuestionLimit(savedConfig.totalQuestionLimit || (source.source_type === 'PDF' && source.page_count ? Math.min(1000, source.page_count * 5) : 100));
      setTimeRange(savedConfig.timeRange || '');
    } else {
      setPagesToGenerate(source.source_type === 'PDF' && source.page_count ? `1-${source.page_count}` : '');
      setQuestionsPerPage('5');
      setTotalQuestionLimit(source.source_type === 'PDF' && source.page_count ? Math.min(1000, source.page_count * 5) : 100);
      setTimeRange('');
    }
  
    setConfigOpen(true);
    fetchFullPreview(source);
  };
  

  const handleStartQuiz = async () => {
    if (!selectedSource) return;

    // --- NEW LOGIC ---
    // Immediately mark the quiz as "attempted" when the user clicks "Start Quiz"
    setQuizAttemptedSources(prev => new Set(prev).add(selectedSource.id));

    setIsQuizGenerating(true);
    setError('');
  
    try {
      const payload = {
        pages_to_generate: selectedSource.source_type === 'PDF' ? pagesToGenerate : null,
        time_range: selectedSource.source_type === 'YOUTUBE' ? timeRange : null,
        questions_per_page: parseInt(questionsPerPage, 10),
        total_question_limit: totalQuestionLimit,
      };
  
      await axios.post(`/sources/${selectedSource.id}/generate_questions/`, payload);
  
      // --- ORIGINAL LOGIC (kept for tracking successful generations) ---
      // Mark this source ID as having a quiz successfully generated
      setQuizGeneratedSources(prev => new Set(prev).add(selectedSource.id));

      // Save quiz configuration
      setSavedQuizConfigs(prev => ({
        ...prev,
        [selectedSource.id]: {
          pagesToGenerate,
          questionsPerPage,
          totalQuestionLimit,
          timeRange,
        },
      }));
  
      navigate(`/questions/${selectedSource.id}`, {
        state: {
          sourceTitle: getSourceDisplayName(selectedSource),
          pageCount: selectedSource.page_count,
        }
      });
      setConfigOpen(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate quiz. Please check configuration.');
      console.error('Quiz generation error:', err);
    } finally {
      setIsQuizGenerating(false);
    }
  };
  

  const handleCancelQuizGeneration = () => {
    setConfigOpen(false);
    setIsQuizGenerating(false);
  };


  

  if (isLoading && sources.length === 0) {
    return (
      <Container sx={{ textAlign: 'center', mt: 8 }}>
        <CircularProgress size={60} sx={{ color: 'primary.main' }} />
        <Typography sx={{ mt: 2 }}>Loading content...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {scrollbarStyles}
      <Box textAlign="center" mb={5}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ 
          background: 'linear-gradient(45deg, #FF6B35, #FF8A65)', 
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 700, mb: 1 
        }}>
          Content Library
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage uploaded files and generate custom quizzes
        </Typography>
      </Box>

      {error && <Fade in><Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert></Fade>}

      {/* Search and Filters Panel */} 
      {sources.length > 0 && (
        <Paper sx={{ p: 3, mb: 4, backgroundColor: '#2D2D2D', border: '1px solid #404040' }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
                  endAdornment: searchQuery && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setSearchQuery('')}><ClearIcon /></IconButton>
                    </InputAdornment>
                  )
                }}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3.5}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>File Types</InputLabel>
                <Select
                  multiple
                  value={selectedFileTypes}
                  onChange={(e) => setSelectedFileTypes(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
                  input={<OutlinedInput label="File Types" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" sx={{ backgroundColor: getSourceTypeColor(value), color: 'white' }} />
                      ))}
                    </Box>
                  )}
                >
                  {availableFileTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      <Box display="flex" alignItems="center" gap={1}>{getSourceIcon(type)}{type}</Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3.5}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Sort By</InputLabel>
                <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} label="Sort By">
                  <MenuItem value="newest">Newest First</MenuItem>
                  <MenuItem value="oldest">Oldest First</MenuItem>
                  <MenuItem value="name">Name (A-Z)</MenuItem>
                  <MenuItem value="type">File Type</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          {(searchQuery || selectedFileTypes.length > 0) && (
            <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #404040' }}>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                <Typography variant="body2" color="text.secondary">
                  Showing {filteredSources.length} of {sources.length} files
                </Typography>
                <Button size="small" onClick={() => { setSearchQuery(''); setSelectedFileTypes([]); }} startIcon={<ClearIcon />}>
                  Clear Filters
                </Button>
              </Stack>
            </Box>
          )}
        </Paper>
      )}

      {filteredSources.length === 0 && !isLoading ? (
        <Paper sx={{ p: 5, textAlign: 'center', background: 'linear-gradient(135deg, #2D2D2D 0%, #363636 100%)', border: '1px solid #404040' }}>
          <Box sx={{ opacity: 0.7, mb: 2 }}>
            {sources.length === 0 ? 
              <ArticleIcon sx={{ fontSize: 80, color: 'text.secondary' }} /> : 
              <FilterListIcon sx={{ fontSize: 80, color: 'text.secondary' }} />
            }
          </Box>
          <Typography variant="h5" gutterBottom>
            {sources.length === 0 ? 'No content uploaded yet' : 'No files match your filters'}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {sources.length === 0 
              ? 'Upload first document or YouTube video to get started.'
              : 'Try adjusting search terms or filters.'}
          </Typography>
          {sources.length === 0 && (
            <Button variant="contained" size="large" onClick={() => navigate('/upload')} sx={{
              background: 'linear-gradient(45deg, #FF6B35, #FF8A65)',
              '&:hover': { background: 'linear-gradient(45deg, #E64A19, #FF6B35)' },
            }}>
              Upload Content
            </Button>
          )}
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredSources.map((source, index) => (
            <Grid item xs={12} md={6} lg={4} key={source.id}>
              <Zoom in timeout={300 + index * 50}>
                <Card sx={{
                  height: '100%', display: 'flex', flexDirection: 'column',
                  background: 'linear-gradient(135deg, #2D2D2D 0%, #363636 100%)',
                  border: '1px solid #404040', borderRadius: 3, transition: 'all 0.3s ease',
                  position: 'relative', overflow: 'visible',
                  '&:hover': { transform: 'translateY(-8px)', boxShadow: '0 12px 24px rgba(255, 107, 53, 0.15)', borderColor: 'primary.main' },
                }}>
                  <Box sx={{ position: 'absolute', top: -8, right: 16, zIndex: 1 }}>
                    <Chip label={source.source_type} size="small" sx={{ backgroundColor: getSourceTypeColor(source.source_type), color: 'white', fontWeight: 600 }} />
                  </Box>
                  <CardContent sx={{ p: 3, pb: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Box display="flex" alignItems="flex-start" gap={2} mb={2}>
                      <Avatar sx={{ backgroundColor: 'rgba(255, 107, 53, 0.1)', border: '2px solid rgba(255, 107, 53, 0.2)', width: 48, height: 48 }}>
                        {getSourceIcon(source.source_type)}
                      </Avatar>
                      <Box flex={1} minWidth={0}>
                        <Tooltip title={getSourceDisplayName(source)} placement="top-start">
                          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem', lineHeight: 1.3, mb: 0.5, wordBreak: 'break-word', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', minHeight: '2.6em' }}>
                            {getSourceDisplayName(source)}
                          </Typography>
                        </Tooltip>
                        <Typography variant="caption" color="text.secondary">
                          {formatDistanceToNow(new Date(source.uploaded_at), { addSuffix: true })}
                        </Typography>
                      </Box>
                    </Box>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
                      {source.page_count && source.source_type === 'PDF' && <Chip icon={<PagesIcon />} label={`${source.page_count} pages`} size="small" variant="outlined" />}
                      {source.video_duration && source.source_type === 'YOUTUBE' && <Chip icon={<AccessTimeIcon />} label={source.video_duration} size="small" variant="outlined" />}
                    </Stack>
                    <Box sx={{ marginTop: 'auto' }}> {/* Pushes buttons to bottom */} 
                      <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
                        
                        {/* Preview Button */}
                        <Tooltip title="Preview Content">
                          <IconButton
                            onClick={() => handlePreviewClick(source)}
                            sx={{
                              backgroundColor: 'rgba(255, 107, 53, 0.1)',
                              '&:hover': {
                                backgroundColor: 'rgba(255, 107, 53, 0.2)',
                                transform: 'scale(1.1)',
                              },
                              transition: 'all 0.2s ease',
                            }}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>

                        {/* Create Quiz Button */}
                        <Button
                          variant="contained"
                          startIcon={<QuizIcon />}
                          onClick={() => handleConfigureQuiz(source)}
                          sx={{
                            flexGrow: 1,
                            mx: 1,
                            background: 'linear-gradient(45deg, #FF6B35, #FF8A65)',
                            '&:hover': {
                              background: 'linear-gradient(45deg, #E64A19, #FF6B35)',
                              transform: 'translateY(-2px)',
                            },
                            transition: 'all 0.2s ease',
                          }}
                        >
                          Create Quiz
                        </Button>

                        {/* --- MODIFIED LOGIC --- */}
                        {/* Retry Button now checks for ATTEMPTED quizzes */}
                        {quizAttemptedSources.has(source.id) && (
                          <Tooltip title="Retry Last Quiz">
                            <IconButton
                              onClick={() => {
                                navigate(`/questions/${source.id}`, {
                                  state: {
                                    sourceTitle: getSourceDisplayName(source),
                                    pageCount: source.page_count
                                  }
                                });
                              }}
                              sx={{
                                backgroundColor: 'rgba(255, 107, 53, 0.1)',
                                '&:hover': {
                                  backgroundColor: 'rgba(255, 107, 53, 0.2)',
                                  transform: 'scale(1.1)',
                                },
                                transition: 'all 0.2s ease',
                              }}
                            >
                              <ReplayIcon />
                            </IconButton>
                          </Tooltip>
                        )}

                        {/* Delete Button */}
                        <Tooltip title="Delete">
                          <IconButton
                            onClick={() => handleDeleteClick(source)}
                            sx={{
                              backgroundColor: 'rgba(244, 67, 54, 0.1)',
                              '&:hover': {
                                backgroundColor: 'rgba(244, 67, 54, 0.2)',
                                transform: 'scale(1.1)',
                              },
                              transition: 'all 0.2s ease',
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                        
                      </Stack>
                    </Box>

                  </CardContent>
                </Card>
              </Zoom>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { backgroundColor: '#2D2D2D', border: '1px solid #404040' } }}>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            {previewSourceForDialog && getSourceIcon(previewSourceForDialog.source_type)}
            <Typography variant="h6" component="div">
              {previewSourceForDialog && getSourceDisplayName(previewSourceForDialog)}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{minHeight: '200px'}}>{renderPreviewDialogContent()}</DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Quiz Configuration Dialog */}
      <Dialog open={configOpen} onClose={() => setConfigOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { backgroundColor: '#2D2D2D', border: '1px solid #404040' } }}>
        <DialogTitle>Configure Quiz for {selectedSource && getSourceDisplayName(selectedSource)}</DialogTitle>
        {isQuizGenerating ? (
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
            <DotLottieReact
              src="https://lottie.host/6b4baba6-5997-489d-9c57-aab2c567cc10/qFAbu26oRX.lottie"
              loop
              autoplay
              style={{ width: '150px', height: '150px' }}
            />
            <Typography sx={{ mt: 2 }}>With more Questions, comes more waiting......</Typography>
          </DialogContent>
        ) : (
          <>
            <DialogContent>

              {selectedSource?.source_type === 'PDF' && (
                <>
                  <TextField
                    fullWidth
                    label="Pages to Generate From"
                    value={pagesToGenerate}
                    onChange={(e) => setPagesToGenerate(e.target.value)}
                    helperText={`E.g., 1,2,3 or 1-5 (Max: ${selectedSource?.page_count || 'N/A'})`}
                    sx={{ mb: 3,mt:1 }}
                  />
                  <TextField
                    fullWidth
                    label="Questions per Page/Section"
                    type="number"
                    value={questionsPerPage}
                    onChange={(e) => setQuestionsPerPage(e.target.value)}
                    InputProps={{ inputProps: { min: 1, max: 20 } }}
                    sx={{ mb: 3 }}
                  />
                </>
              )}

              {selectedSource?.source_type === 'YOUTUBE' && (
                <TextField
                  fullWidth
                  label="Time Ranges (optional)"
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  helperText="E.g., 0:00-5:30, 10:15-15:45"
                  sx={{ mb: 3, mt:1 }}
                />
              )}

              {/* Show slider for all types EXCEPT PDFs */}
              {selectedSource?.source_type !== 'PDF' && (
                <>
                  <Typography gutterBottom>Total Question Limit (max 100)</Typography>
                  <Slider
                    value={totalQuestionLimit}
                    onChange={(e, newValue) => setTotalQuestionLimit(newValue)}
                    min={5}
                    max={100}
                    step={5}
                    marks
                    valueLabelDisplay="auto"
                  />
                </>
              )}

            </DialogContent>
            <DialogActions>
              <Button onClick={handleCancelQuizGeneration}>Cancel</Button>
              <Button onClick={handleStartQuiz} variant="contained">Start Quiz</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} PaperProps={{ sx: { backgroundColor: '#2D2D2D', border: '1px solid #404040' } }}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{sourceToDelete && getSourceDisplayName(sourceToDelete)}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SavedFilesPage;
