import React, { useState } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  CircularProgress,
  Alert,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Fade,
  Chip,
  Stack,
  Tooltip,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  YouTube as YouTubeIcon,
  AttachFile as AttachFileIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  TextFields as TextFieldsIcon,
  Image as ImageIcon, // Added ImageIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Tesseract from 'tesseract.js'; // Added Tesseract.js import

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/bmp'
];
const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.pptx', '.txt', '.png', '.jpg', '.jpeg', '.webp', '.bmp'];

const FILE_TYPE_LABELS = {
  '.pdf': 'PDF',
  '.docx': 'Word',
  '.pptx': 'PowerPoint',
  '.txt': 'Text',
  '.png': 'PNG Image',
  '.jpg': 'JPEG Image',
  '.jpeg': 'JPEG Image',
  '.webp': 'WEBP Image',
  '.bmp': 'BMP Image'
};

const MIN_WORDS = 100; // Minimum words for generating 10-20 questions

const UploadPage = () => {
  const [uploadType, setUploadType] = useState('file');
  const [file, setFile] = useState(null);
  const [youtubeLink, setYoutubeLink] = useState('');
  const [textContent, setTextContent] = useState('');
  const [textTitle, setTextTitle] = useState('');
  const [imageName, setImageName] = useState(''); // Added for image name input
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const resetMessages = () => {
    setError('');
    setSuccess('');
  };

  const countWords = (text) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const validateFile = (selectedFile) => {
    if (selectedFile.size > MAX_FILE_SIZE) {
      return `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`;
    }
    const fileExtension = '.' + selectedFile.name.split('.').pop().toLowerCase();
    const isImage = selectedFile.type.startsWith('image/');

    if (uploadType === 'image' && !isImage) {
      return `Unsupported file type for image upload. Please use: ${Object.values(FILE_TYPE_LABELS).filter(label => label.includes('Image')).join(', ')}`;
    }

    // For 'file' upload type, exclude image types from validation if we are not in 'image' mode
    const validFileTypesForFileMode = ALLOWED_FILE_TYPES.filter(type => !type.startsWith('image/'));
    const validExtensionsForFileMode = ALLOWED_EXTENSIONS.filter(ext => !['.png', '.jpg', '.jpeg', '.webp', '.bmp'].includes(ext));

    if (uploadType === 'file' && (!validExtensionsForFileMode.includes(fileExtension) || !validFileTypesForFileMode.includes(selectedFile.type))) {
      return `Unsupported file type. Please use: ${Object.values(FILE_TYPE_LABELS).filter(label => !label.includes('Image')).join(', ')}`;
    }
    
    // General validation for other types or if specific checks didn't catch it
    if (uploadType !== 'file' && uploadType !== 'image' && (!ALLOWED_EXTENSIONS.includes(fileExtension) || !ALLOWED_FILE_TYPES.includes(selectedFile.type))) {
      return `Unsupported file type. Please use: ${Object.values(FILE_TYPE_LABELS).join(', ')}`;
    }
    
    return null;
  };

  const validateYouTubeLink = (link) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/)[\w-]+/;
    return youtubeRegex.test(link); 
  };

  const validateTextInput = () => {
    if (!textTitle.trim()) {
      return 'Please enter a title for your text content';
    }
    if (!textContent.trim()) {
      return 'Please enter some text content';
    }
    const wordCount = countWords(textContent);
    if (wordCount < MIN_WORDS) {
      return `Text too short. Please enter at least ${MIN_WORDS} words for generating meaningful quiz questions. Current: ${wordCount} words`;
    }
    return null;
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    resetMessages();
    
    if (!selectedFile) {
      setFile(null);
      return;
    }

    const validationError = validateFile(selectedFile);
    if (validationError) {
      setError(validationError);
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

  const handleYoutubeLinkChange = (event) => {
    setYoutubeLink(event.target.value);
    resetMessages();
  };

  const handleTextContentChange = (event) => {
    setTextContent(event.target.value);
    resetMessages();
  };

  const handleImageNameChange = (event) => {
    setImageName(event.target.value);
    resetMessages();
  };

  const handleTextTitleChange = (event) => {
    setTextTitle(event.target.value);
    resetMessages();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    resetMessages();

    try {
      const formData = new FormData();
      let url = '';

      if (uploadType === 'file') {
        if (!file) {
          throw new Error('Please select a file to upload');
        }
        formData.append('file', file);
        url = '/sources/upload_file/';
      } else if (uploadType === 'youtube') {
        if (!youtubeLink.trim()) {
          throw new Error('Please enter a YouTube link');
        }
        if (!validateYouTubeLink(youtubeLink)) {
          throw new Error('Please enter a valid YouTube URL');
        }
        formData.append('youtube_link', youtubeLink);
        url = '/sources/process_youtube_link/';
      } else if (uploadType === 'text') {
        const textValidationError = validateTextInput();
        if (textValidationError) {
          throw new Error(textValidationError);
        }
        
        // Create a text file from the input
        const fileName = `${textTitle.trim()}.txt`;
        const textBlob = new Blob([textContent], { type: 'text/plain' });
        const textFile = new File([textBlob], fileName, { type: 'text/plain' });
        
        formData.append('file', textFile);
        url = '/sources/upload_file/';
      } else if (uploadType === 'image') {
        if (!file) {
          throw new Error('Please select an image file to upload');
        }
        if (!imageName.trim()) {
          throw new Error('Please enter a name for the extracted text file');
        }
        
        setSuccess('Extracting text from image... This may take a moment.');
        const { data: { text } } = await Tesseract.recognize(file, 'eng', {
          logger: m => console.log(m) // Optional: for progress logging
        });
        
        if (!text || text.trim().length === 0) {
          throw new Error('Could not extract any text from the image, or the image is empty.');
        }

        const extractedTextFileName = `imgext_${imageName.trim().replace(/\s+/g, '_')}.txt`;
        const textBlob = new Blob([text], { type: 'text/plain' });
        const textFile = new File([textBlob], extractedTextFileName, { type: 'text/plain' });

        formData.append('file', textFile);
        url = '/sources/upload_file/';
      }

      const response = await axios.post(url, formData, {
        headers: {
          'Content-Type': uploadType === 'file' || uploadType === 'text' || uploadType === 'image' ? 'multipart/form-data' : 'application/json',
        },
      });

      response && response.data && console.log(response.data);

      const contentTypeMap = {
        'file': 'file',
        'youtube': 'YouTube video',
        'text': 'text content',
        'image': 'image'
      };
      const contentType = contentTypeMap[uploadType];
      setSuccess(`✨ Successfully processed ${contentType}! Redirecting to your saved files...`);
      
      // Reset form
      setFile(null);
      setYoutubeLink('');
      setTextContent('');
      setTextTitle('');
      setImageName('');
      
      // Navigate after delay
      setTimeout(() => navigate('/saved-files'), 2000);
      
    } catch (err) {
      const errorMessage = err.message || 
        err.response?.data?.error || 
        `Failed to process ${uploadType}. Please try again.`;
        if (errorMessage === 'Request failed with status code 409') {
          let errorMessage2 = 'Content already exists in database refer to saved files to practice with it.';
          setError(errorMessage2);
        }
        else {
        setError(errorMessage);
        }
      console.error('Upload error:', err.response || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getFileIcon = (fileName) => {
    const extension = '.' + fileName.split('.').pop().toLowerCase();
    return FILE_TYPE_LABELS[extension] || 'File';
  };

  const wordCount = countWords(textContent);
  const isTextValid = uploadType === 'text' ? wordCount >= MIN_WORDS && textTitle.trim() : true;

  return (
    <Container maxWidth="lg" sx={{ py: 2, width: '985px' }}>
      <Fade in timeout={600}>
        <Paper 
          elevation={0} 
          sx={{ 
            p: 5, 
            background: 'linear-gradient(135deg, #2D2D2D 0%, #363636 100%)',
            border: '1px solid #404040',
            borderRadius: 3,
          }}
        >
          {/* Header */}
          <Box textAlign="center" mb={4}>
            <Typography 
              variant="h3" 
              component="h1" 
              gutterBottom
              sx={{ 
                background: 'linear-gradient(45deg, #FF6B35, #FF8A65)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 700,
                mb: 1,
              }}
            >
              Create Your Quiz
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto' }}>
              Upload to generate interactive quiz questions
            </Typography>
          </Box>

          {/* Upload Type Selection */}
          <FormControl component="fieldset" sx={{ mb: 4, width: '100%' }}>
            <FormLabel 
              component="legend" 
              sx={{ 
                color: 'text.primary', 
                fontWeight: 500,
                mb: 2,
                '&.Mui-focused': { color: 'primary.main' }
              }}
            >
              Choose Content Source
            </FormLabel>
            <RadioGroup 
              row 
              value={uploadType} 
              onChange={(e) => {
                setUploadType(e.target.value);
                resetMessages();
                setFile(null);
                setYoutubeLink('');
                setTextContent('');
                setTextTitle('');
                setImageName('');
              }}
              sx={{
                gap: 2,
                '& .MuiFormControlLabel-root': {
                  border: '1px solid #404040',
                  borderRadius: 2,
                  px: 2,
                  py: 1,
                  margin: 0,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: 'primary.main',
                    backgroundColor: 'rgba(255, 107, 53, 0.05)',
                  },
                },
                '& .Mui-checked + .MuiFormControlLabel-label': {
                  color: 'primary.main',
                },
              }}
            >
              <FormControlLabel 
                value="file" 
                control={<Radio />} 
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    <AttachFileIcon fontSize="small" />
                    <span>Upload File</span>
                  </Box>
                } 
              />
              <FormControlLabel 
                value="youtube" 
                control={<Radio />} 
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    <YouTubeIcon fontSize="small" />
                    <span>YouTube Video</span>
                  </Box>
                } 
              />
              <FormControlLabel 
                value="text" 
                control={<Radio />} 
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    <TextFieldsIcon fontSize="small" />
                    <span>Paste Text</span>
                  </Box>
                } 
              />
              <FormControlLabel 
                value="image" 
                control={<Radio />} 
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    <ImageIcon fontSize="small" />
                    <span>Upload Image</span>
                  </Box>
                } 
              />
            </RadioGroup>
          </FormControl>

          <form onSubmit={handleSubmit}>
            {/* File Upload Section */}
            {uploadType === 'file' && (
              <Fade in timeout={300}>
                <Box sx={{ mb: 4 }}>
                  <Box 
                    sx={{
                      border: file ? '2px solid' : '2px dashed',
                      borderColor: file ? 'success.main' : '#404040',
                      borderRadius: 3,
                      p: 4,
                      textAlign: 'center',
                      backgroundColor: file ? 'rgba(76, 175, 80, 0.05)' : 'transparent',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: 'primary.main',
                        backgroundColor: 'rgba(255, 107, 53, 0.05)',
                      },
                    }}
                  >
                    {file ? (
                      <Box>
                        <CheckCircleIcon 
                          sx={{ fontSize: 48, color: 'success.main', mb: 2 }} 
                        />
                        <Typography variant="h6" gutterBottom>
                          {file.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {(file.size / 1024 / 1024).toFixed(2)} MB • {getFileIcon(file.name)}
                        </Typography>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => setFile(null)}
                          sx={{ mt: 1 }}
                        >
                          Choose Different File
                        </Button>
                      </Box>
                    ) : (
                      <Box>
                        <Button
                          variant="contained"
                          component="label"
                          size="large"
                          startIcon={<CloudUploadIcon />}
                          sx={{ mb: 2 }}
                        >
                          Choose File
                          <input 
                            type="file" 
                            hidden 
                            onChange={handleFileChange} 
                            accept={uploadType === 'image' ? 'image/*' : ALLOWED_EXTENSIONS.filter(ext => !['.png', '.jpg', '.jpeg', '.webp', '.bmp'].includes(ext)).join(',')}
                          />
                        </Button>
                        <Typography variant="body2" color="text.secondary">
                          Drop your file here or click to browse
                        </Typography>
                      </Box>
                    )}
                  </Box>
                  
                  {/* File Type Info */}
                  <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Tooltip title="Supported file formats">
                      <InfoIcon fontSize="small" color="action" />
                    </Tooltip>
                    <Stack direction="row" spacing={1}>
                      {Object.entries(FILE_TYPE_LABELS)
                        .filter(([ext, label]) => uploadType === 'image' ? label.includes('Image') : !label.includes('Image'))
                        .map(([ext, label]) => (
                        <Chip 
                          key={ext}
                          label={label} 
                          size="small" 
                          variant="outlined"
                          sx={{ fontSize: '0.75rem' }}
                        />
                      ))}
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      • Max 10MB
                    </Typography>
                  </Box>
                </Box>
              </Fade>
            )}

            {/* Image Upload Section */}
            {uploadType === 'image' && (
              <Fade in timeout={300}>
                <Box sx={{ mb: 4 }}>
                   <TextField
                    fullWidth
                    label="Name for Extracted Text File (e.g., 'invoice_details')"
                    variant="outlined"
                    value={imageName}
                    onChange={handleImageNameChange}
                    placeholder="Enter a name..."
                    sx={{
                      mb: 3,
                      '& .MuiOutlinedInput-root': {
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'primary.main',
                          borderWidth: 2,
                        },
                      },
                    }}
                  />
                  <Box 
                    sx={{
                      border: file ? '2px solid' : '2px dashed',
                      borderColor: file ? 'success.main' : '#404040',
                      borderRadius: 3,
                      p: 4,
                      textAlign: 'center',
                      backgroundColor: file ? 'rgba(76, 175, 80, 0.05)' : 'transparent',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: 'primary.main',
                        backgroundColor: 'rgba(255, 107, 53, 0.05)',
                      },
                    }}
                  >
                    {file ? (
                      <Box>
                        <CheckCircleIcon 
                          sx={{ fontSize: 48, color: 'success.main', mb: 2 }} 
                        />
                        <Typography variant="h6" gutterBottom>
                          {file.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {(file.size / 1024 / 1024).toFixed(2)} MB • {getFileIcon(file.name)}
                        </Typography>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => setFile(null)}
                          sx={{ mt: 1 }}
                        >
                          Choose Different Image
                        </Button>
                      </Box>
                    ) : (
                      <Box>
                        <Button
                          variant="contained"
                          component="label"
                          size="large"
                          startIcon={<CloudUploadIcon />}
                          sx={{ mb: 2 }}
                        >
                          Choose Image
                          <input 
                            type="file" 
                            hidden 
                            onChange={handleFileChange} 
                            accept="image/*" 
                          />
                        </Button>
                        <Typography variant="body2" color="text.secondary">
                          Drop your image here or click to browse
                        </Typography>
                      </Box>
                    )}
                  </Box>
                  
                  {/* File Type Info */}
                  <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Tooltip title="Supported image formats">
                      <InfoIcon fontSize="small" color="action" />
                    </Tooltip>
                    <Stack direction="row" spacing={1}>
                      {Object.entries(FILE_TYPE_LABELS)
                        .filter(([ext, label]) => label.includes('Image'))
                        .map(([ext, label]) => (
                        <Chip 
                          key={ext}
                          label={label} 
                          size="small" 
                          variant="outlined"
                          sx={{ fontSize: '0.75rem' }}
                        />
                      ))}
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      • Max 10MB
                    </Typography>
                  </Box>
                </Box>
              </Fade>
            )}

            {/* YouTube Upload Section */}
            {uploadType === 'youtube' && (
              <Fade in timeout={300}>
                <Box sx={{ mb: 4 }}>
                  <TextField
                    fullWidth
                    label="YouTube Video URL"
                    variant="outlined"
                    value={youtubeLink}
                    onChange={handleYoutubeLinkChange}
                    placeholder="https://www.youtube.com/watch?v=..."
                    InputProps={{
                      startAdornment: (
                        <YouTubeIcon sx={{ mr: 1, color: '#FF0000' }} />
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'primary.main',
                          borderWidth: 2,
                        },
                      },
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Paste any YouTube video URL to extract and analyze its content
                  </Typography>
                </Box>
              </Fade>
            )}

            {/* Text Input Section */}
            {uploadType === 'text' && (
              <Fade in timeout={300}>
                <Box sx={{ mb: 4 }}>
                  {/* Title Input */}
                  <TextField
                    fullWidth
                    label="Content Title"
                    variant="outlined"
                    value={textTitle}
                    onChange={handleTextTitleChange}
                    placeholder="Enter a title for your content..."
                    sx={{
                      mb: 3,
                      '& .MuiOutlinedInput-root': {
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'primary.main',
                          borderWidth: 2,
                        },
                      },
                    }}
                  />

                  {/* Text Content Input */}
                  <TextField
                    fullWidth
                    label="Paste or Type Your Content"
                    variant="outlined"
                    multiline
                    rows={8}
                    value={textContent}
                    onChange={handleTextContentChange}
                    placeholder="Paste your study material, notes, articles, or any text content here..."
                    InputProps={{
                      startAdornment: (
                        <TextFieldsIcon sx={{ mr: 1, color: 'primary.main', alignSelf: 'flex-start', mt: 1 }} />
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        alignItems: 'flex-start',
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'primary.main',
                          borderWidth: 2,
                        },
                      },
                      '& .MuiInputBase-input': {
                        pl: 0,
                      },
                    }}
                  />

                  {/* Word Count and Requirements */}
                  <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Tooltip title="Minimum words required for generating quality quiz questions">
                        <InfoIcon fontSize="small" color="action" />
                      </Tooltip>
                      <Typography variant="caption" color="text.secondary">
                        Minimum {MIN_WORDS} words required for quality quiz generation
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography 
                        variant="body2" 
                        color={wordCount >= MIN_WORDS ? 'success.main' : wordCount > 0 ? 'warning.main' : 'text.secondary'}
                        sx={{ fontWeight: 500 }}
                      >
                        {wordCount} words
                      </Typography>
                      {wordCount >= MIN_WORDS && (
                        <CheckCircleIcon fontSize="small" color="success.main" />
                      )}
                    </Box>
                  </Box>
                </Box>
              </Fade>
            )}
            
            {/* Messages */}
            <Box sx={{ mb: 3 }}>
              {error && (
                <Fade in>
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                </Fade>
              )}
              {success && (
                <Fade in>
                  <Alert severity="success" sx={{ mb: 2 }}>
                    {success}
                  </Alert>
                </Fade>
              )}
            </Box>

            {/* Submit Button */}
            <Box sx={{ textAlign: 'center' }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={
                  isLoading || 
                  (!file && uploadType === 'file') || 
                  (!youtubeLink.trim() && uploadType === 'youtube') ||
                  (!isTextValid && uploadType === 'text') ||
                  ((!file || !imageName.trim()) && uploadType === 'image')
                }
                size="large"
                sx={{ 
                  minWidth: 200,
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
                  '&:disabled': {
                    background: '#404040',
                    color: '#707070',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                {isLoading ? (
                  <Box display="flex" alignItems="center" gap={1}>
                    <CircularProgress size={20} color="inherit" />
                    <span>Processing...</span>
                  </Box>
                ) : (
                  `Generate Quiz from ${uploadType === 'file' ? 'File' : uploadType === 'youtube' ? 'YouTube' : uploadType === 'text' ? 'Text' : 'Image'}`
                )}
              </Button>
            </Box>
          </form>
        </Paper>
      </Fade>
    </Container>
  );
};

export default UploadPage;