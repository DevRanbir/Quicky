import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  LinearProgress,
  Card,
  CardContent,
  Grid,
  Chip,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Divider,
  Badge,
  Container,
  Stack,
  Avatar,
  useTheme,
  GlobalStyles,
  MenuItem,
  Menu
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CheckCircleOutline as CheckCircleOutlineIcon,
  HighlightOff as HighlightOffIcon,
  Quiz as QuizIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Refresh as RefreshIcon,
  Home as HomeIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  Download as DownloadIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  Description as WordIcon,
  Replay as ReplayIcon,
  Keyboard as KeyboardIcon
} from '@mui/icons-material';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; 
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
const SIDEBAR_WIDTH = 340;

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

 // Export functions

const exportToPDF = (quizData) => {
  const { score, allQuestions, selectedAnswers, percentage } = quizData;
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(20);
  doc.text('Quiz Results', 20, 20);
  
  // Score summary
  doc.setFontSize(14);
  doc.text(`Score: ${score} / ${allQuestions.length} (${percentage}%)`, 20, 40);
  doc.text(`Status: ${percentage >= 70 ? 'PASSED' : 'FAILED'}`, 20, 50);
  
  // Prepare table data
  const tableData = allQuestions.map((q, index) => {
    const isCorrect = selectedAnswers[q.id] === q.correct_answer;
    return [
      index + 1,
      q.question_text.substring(0, 60) + (q.question_text.length > 60 ? '...' : ''),
      q.options[selectedAnswers[q.id]] || 'Not answered',
      q.options[q.correct_answer],
      isCorrect ? 'Correct' : 'Wrong',
      q.page_number || 1
    ];
  });
  
  // Use autoTable with the doc instance
  autoTable(doc, {
    head: [['#', 'Question', 'Your Answer', 'Correct Answer', 'Result', 'Page']],
    body: tableData,
    startY: 60,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [66, 139, 202] },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 60 },
      2: { cellWidth: 40 },
      3: { cellWidth: 40 },
      4: { cellWidth: 20 },
      5: { cellWidth: 15 }
    }
  });
  
  // Get the final Y position from the last table
  const finalY = doc.lastAutoTable?.finalY || 60;
  let yPosition = finalY + 20;
  
  // Add explanations on new pages if needed
  allQuestions.forEach((q, index) => {
    if (q.explanation) {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(10);
      doc.text(`Q${index + 1} Explanation:`, 20, yPosition);
      yPosition += 10;
      
      const splitExplanation = doc.splitTextToSize(q.explanation, 170);
      doc.text(splitExplanation, 20, yPosition);
      yPosition += splitExplanation.length * 5 + 10;
    }
  });
  
  doc.save('quiz-results.pdf');
};

const exportToExcel = (quizData) => {
  const { score, allQuestions, selectedAnswers, percentage } = quizData;
  
  // Summary sheet data
  const summaryData = [
    ['Quiz Results Summary'],
    [''],
    ['Total Questions', allQuestions.length],
    ['Correct Answers', score],
    ['Percentage', `${percentage}%`],
    ['Status', percentage >= 70 ? 'PASSED' : 'FAILED'],
    ['']
  ];
  
  // Detailed results data
  const detailedData = [
    ['Question #', 'Question Text', 'Your Answer', 'Correct Answer', 'Result', 'Page Number', 'Explanation']
  ];
  
  allQuestions.forEach((q, index) => {
    const isCorrect = selectedAnswers[q.id] === q.correct_answer;
    detailedData.push([
      index + 1,
      q.question_text,
      q.options[selectedAnswers[q.id]] || 'Not answered',
      q.options[q.correct_answer],
      isCorrect ? 'Correct' : 'Wrong',
      q.page_number || 1,
      q.explanation || ''
    ]);
  });
  
  // Create workbook
  const wb = XLSX.utils.book_new();
  
  // Add summary sheet
  const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');
  
  // Add detailed results sheet
  const detailedWs = XLSX.utils.aoa_to_sheet(detailedData);
  XLSX.utils.book_append_sheet(wb, detailedWs, 'Detailed Results');
  
  // Save file
  XLSX.writeFile(wb, 'quiz-results.xlsx');
};

const exportToWord = (quizData) => {
  const { score, allQuestions, selectedAnswers, percentage } = quizData;
  
  let htmlContent = `
    <html>
      <head>
        <meta charset="utf-8">
        <title>Quiz Results</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .summary { background-color: #f5f5f5; padding: 15px; margin-bottom: 20px; }
          .question { margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; }
          .correct { background-color: #d4edda; }
          .incorrect { background-color: #f8d7da; }
          .explanation { background-color: #e9ecef; padding: 10px; margin-top: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Quiz Results</h1>
        </div>
        
        <div class="summary">
          <h2>Summary</h2>
          <p><strong>Score:</strong> ${score} / ${allQuestions.length} (${percentage}%)</p>
          <p><strong>Status:</strong> ${percentage >= 70 ? 'PASSED' : 'FAILED'}</p>
        </div>
        
        <h2>Detailed Results</h2>
  `;
  
  allQuestions.forEach((q, index) => {
    const isCorrect = selectedAnswers[q.id] === q.correct_answer;
    htmlContent += `
      <div class="question ${isCorrect ? 'correct' : 'incorrect'}">
        <h3>Question ${index + 1} (Page ${q.page_number || 1})</h3>
        <p><strong>Question:</strong> ${q.question_text}</p>
        <p><strong>Your Answer:</strong> ${q.options[selectedAnswers[q.id]] || 'Not answered'}</p>
        ${!isCorrect ? `<p><strong>Correct Answer:</strong> ${q.options[q.correct_answer]}</p>` : ''}
        <p><strong>Result:</strong> ${isCorrect ? 'Correct ✓' : 'Wrong ✗'}</p>
        ${q.explanation ? `<div class="explanation"><strong>Explanation:</strong> ${q.explanation}</div>` : ''}
      </div>
    `;
  });
  
  htmlContent += `
      </body>
    </html>
  `;
  
  // Create blob and download
  const blob = new Blob([htmlContent], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'quiz-results.doc';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};


const QuestionsPage = () => {
  const { sourceId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();

  const [allQuestions, setAllQuestions] = useState([]);
  const [questionsByPage, setQuestionsByPage] = useState({});
  const [currentQuizPage, setCurrentQuizPage] = useState(1);
  const [quizPages, setQuizPages] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const rightSidebarScrollRef = useRef(null);
  const [rightSidebarScrollPosition, setRightSidebarScrollPosition] = useState(0);

  const [currentQuestionIndexOnPage, setCurrentQuestionIndexOnPage] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showIntro, setShowIntro] = useState(true); 
  
  const handleDismissIntro = () => {
    setShowIntro(false);
  };

  useEffect(() => {
    const fetchAndGroupQuestions = async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await axios.get(`/questions/?source_id=${sourceId}`);
        if (response.data && response.data.length > 0) {
          const sortedQuestions = [...response.data].sort((a, b) => {
            // Sort by page number first, then by question order if needed
            const pageA = a.page_number || 1;
            const pageB = b.page_number || 1;
            if (pageA !== pageB) return pageA - pageB;
            return a.id - b.id; // You can also use `a.index` or `a.question_number` if available
          });
  
          setAllQuestions(sortedQuestions);
  
          const grouped = sortedQuestions.reduce((acc, q) => {
            const pageNum = q.page_number || 1;
            if (!acc[pageNum]) acc[pageNum] = [];
            acc[pageNum].push(q);
            return acc;
          }, {});
  
          setQuestionsByPage(grouped);
  
          const pagesWithQuestions = Object.keys(grouped).map(Number).sort((a, b) => a - b);
          setQuizPages(pagesWithQuestions);
  
          if (pagesWithQuestions.length > 0) {
            setCurrentQuizPage(pagesWithQuestions[0]);
            setCurrentQuestionIndexOnPage(0);
          } else {
            setError('No questions found for this source, or questions are not grouped by page.');
          }
        } else {
          setError('No questions found for this source. Please ensure questions have been generated.');
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch questions. Please try again.');
        console.error('Fetch questions error:', err);
      }
      setIsLoading(false);
    };
  
    if (sourceId) {
      fetchAndGroupQuestions();
    } else {
      setError('Source ID is missing.');
      setIsLoading(false);
    }
  }, [sourceId]);

  useEffect(() => {
    if (rightSidebarScrollRef.current) {
      rightSidebarScrollRef.current.scrollTop = rightSidebarScrollPosition;
    }
  }, [currentQuestionIndexOnPage, rightSidebarScrollPosition]);

  // Add this useEffect to track scroll changes
  useEffect(() => {
    const scrollElement = rightSidebarScrollRef.current;
    if (!scrollElement) return;

    const handleScroll = () => {
      setRightSidebarScrollPosition(scrollElement.scrollTop);
    };

    scrollElement.addEventListener('scroll', handleScroll);
    return () => scrollElement.removeEventListener('scroll', handleScroll);
  }, []);
  

  const currentQuizPageQuestions = questionsByPage[currentQuizPage] || [];
  const currentQuestion = currentQuizPageQuestions[currentQuestionIndexOnPage];
  

  const handleAnswerChange = (questionId, selectedOptionKey) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: selectedOptionKey,
    });
  };

  const handleSubmitQuiz = async () => {
    setIsSubmitting(true);
    let currentScore = 0;
    allQuestions.forEach(q => {
      if (selectedAnswers[q.id] === q.correct_answer) {
        currentScore++;
      }
    });
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setScore(currentScore);
    setQuizFinished(true);
    setIsSubmitting(false);
  };

  const handleRetryQuiz = () => {
    setSelectedAnswers({});
    setScore(0);
    setQuizFinished(false);
    if (quizPages.length > 0) {
      setCurrentQuizPage(quizPages[0]);
      setCurrentQuestionIndexOnPage(0);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (quizFinished || isLoading || isSubmitting) return; // Disable keyboard navigation if quiz is finished or loading

      const currentQuestionOptions = currentQuestion?.options ? Object.keys(currentQuestion.options) : [];

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          handlePreviousPage();
          break;
        case 'ArrowRight':
          event.preventDefault();
          handleNextPage();
          break;
        case 'ArrowUp':
          event.preventDefault();
          handlePreviousQuestion();
          break;
        case 'ArrowDown':
          event.preventDefault();
          handleNextQuestion();
          break;
        case ' ': // Spacebar to select current answer
          event.preventDefault();
          // Logic to select the current answer, if applicable
          // For now, let's assume it selects the first option if none is selected
          if (currentQuestion && !selectedAnswers[currentQuestion.id] && currentQuestionOptions.length > 0) {
            handleAnswerChange(currentQuestion.id, currentQuestionOptions[0]);
          }
          break;
        default:
          // Handle number keys (1-9) or 'a', 'b', 'c', 'd' for option selection
          if (currentQuestion) {
            let selectedOptionIndex = -1;
            if (!isNaN(parseInt(event.key))) {
              selectedOptionIndex = parseInt(event.key) - 1;
            } else if (event.key.length === 1 && event.key.match(/[a-d]/i)) {
              selectedOptionIndex = event.key.toLowerCase().charCodeAt(0) - 'a'.charCodeAt(0);
            }

            if (selectedOptionIndex >= 0 && selectedOptionIndex < currentQuestionOptions.length) {
              event.preventDefault();
              handleAnswerChange(currentQuestion.id, currentQuestionOptions[selectedOptionIndex]);
            }
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentQuizPage, currentQuestionIndexOnPage, allQuestions, selectedAnswers, quizFinished, isLoading, isSubmitting, currentQuestion, handleAnswerChange]);

  const handleNextQuestion = () => {
    const questionsOnCurrentPage = questionsByPage[currentQuizPage] || [];
    if (currentQuestionIndexOnPage < questionsOnCurrentPage.length - 1) {
      setCurrentQuestionIndexOnPage(prevIndex => prevIndex + 1);
    } else {
      // If on the last question of the current page, move to the next page
      handleNextPage();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndexOnPage > 0) {
      setCurrentQuestionIndexOnPage(prevIndex => prevIndex - 1);
    } else {
      // If on the first question of the current page, move to the previous page
      handlePreviousPage();
    }
  };

  const handleNextPage = () => {
    const currentPageIndex = quizPages.indexOf(currentQuizPage);
    if (currentPageIndex < quizPages.length - 1) {
      setCurrentQuizPage(quizPages[currentPageIndex + 1]);
      setCurrentQuestionIndexOnPage(0); // Go to the first question of the new page
    }
  };

  const handlePreviousPage = () => {
    const currentPageIndex = quizPages.indexOf(currentQuizPage);
    if (currentPageIndex > 0) {
      setCurrentQuizPage(quizPages[currentPageIndex - 1]);
      setCurrentQuestionIndexOnPage(0); // Go to the first question of the new page
    }
  };

  const handlePageChange = (pageNum) => {
    setCurrentQuizPage(pageNum);
    setCurrentQuestionIndexOnPage(0);
  };

  const handleQuestionSelect = (questionIndex) => {
    // Save current scroll position
    if (rightSidebarScrollRef.current) {
      setRightSidebarScrollPosition(rightSidebarScrollRef.current.scrollTop);
    }
    setCurrentQuestionIndexOnPage(questionIndex);
  };

  const getQuestionStatus = (question) => {
    if (selectedAnswers[question.id]) {
      return quizFinished ? 
        (selectedAnswers[question.id] === question.correct_answer ? 'correct' : 'incorrect') 
        : 'answered';
    }
    return 'unanswered';
  };

  const getQuestionIcon = (question) => {
    const status = getQuestionStatus(question);
    switch (status) {
      case 'correct':
        return <CheckCircleIcon color="success" />;
      case 'incorrect':
        return <CancelIcon color="error" />;
      case 'answered':
        return <CheckCircleOutlineIcon color="primary" />;
      default:
        return <RadioButtonUncheckedIcon color="disabled" />;
    }
  };

  // Left Sidebar - Navigation
  const LeftSidebar = () => (
    <Drawer
      variant="permanent"
      sx={{
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          maxWidth: SIDEBAR_WIDTH,
          width: '280px',
          boxSizing: 'border-box',
          backgroundColor: theme.palette.background.paper,
          borderRight: `1px solid ${theme.palette.divider}`,
          top: '80px',
          direction: 'rtl',
          height: 'calc(100vh - 80px)',
        },
      }}
    >
      {scrollbarStyles}
      <Box sx={{ p: 3 }}>

        <Typography variant="subtitle2" sx={{ mr:11, mb: 2, color: theme.palette.text.secondary}}>
          Source Pages ({quizPages.length})
        </Typography>
        
        <List sx={{ p: 0 }}>
          {quizPages.map((pageNum) => (
            <PageListItem
              key={pageNum}
              pageNum={pageNum}
              questionsByPage={questionsByPage}
              selectedAnswers={selectedAnswers}
              currentQuizPage={currentQuizPage}
              handlePageChange={handlePageChange}
              theme={theme}
            />
          ))}        </List>

        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Progress
          </Typography>
          <LinearProgress
            variant="determinate"
            value={(Object.keys(selectedAnswers).length / allQuestions.length) * 100}
            sx={{ mb: 1, height: 8, borderRadius: 4 }}
          />
          <Typography variant="caption" color="text.secondary">
            {Object.keys(selectedAnswers).length}/{allQuestions.length}  answered
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );

  const PageListItem = ({ pageNum, questionsByPage, selectedAnswers, currentQuizPage, handlePageChange, theme }) => {
    const pageQuestions = questionsByPage[pageNum] || [];
    const answeredCount = pageQuestions.filter(q => selectedAnswers[q.id]).length;
    const pageRef = useRef(null);
  
    useEffect(() => {
      if (currentQuizPage === pageNum && pageRef.current) {
        pageRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      }
    }, [currentQuizPage, pageNum]);
  
    return (
      <ListItem key={pageNum} disablePadding sx={{ mb: 1 }}>
        <ListItemButton
          ref={pageRef}
          selected={currentQuizPage === pageNum}
          onClick={() => handlePageChange(pageNum)}
          sx={{
            borderRadius: 2,
            '&.Mui-selected': {
              backgroundColor: theme.palette.primary.main + '20',
              '&:hover': {
                backgroundColor: theme.palette.primary.main + '30',
              }
            }
          }}
        >
          <ListItemIcon>
            <Badge badgeContent={answeredCount} color="primary" max={99}>
              <QuizIcon color={currentQuizPage === pageNum ? 'primary' : 'disabled'} />
            </Badge>
          </ListItemIcon>
          <ListItemText
            primary={`Page ${pageNum}`}
            secondary={`${pageQuestions.length} questions`}
          />
        </ListItemButton>
      </ListItem>
    );
  };

  // Right Sidebar - Questions List
  const RightSidebar = () => (
    <Drawer
      variant="permanent"
      anchor="right"
      sx={{
        width: SIDEBAR_WIDTH,
        ml: 0,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: SIDEBAR_WIDTH,
          boxSizing: 'border-box',
          backgroundColor: theme.palette.background.paper,
          borderLeft: `1px solid ${theme.palette.divider}`,
          top: '80px',
          height: 'calc(120vh - 80px)',
        },
      }}
    >
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, color: theme.palette.primary.main, fontWeight: 600 }}>
          Questions
        </Typography>
        
        <List sx={{ p: 0, maxHeight: 'calc(100vh - 300px)', overflow: 'hidden auto' }} ref={rightSidebarScrollRef}>
          {currentQuizPageQuestions.map((question, index) => (
            <QuestionListItem
              key={question.id}
              question={question}
              index={index}
              currentQuestionIndexOnPage={currentQuestionIndexOnPage}
              handleQuestionSelect={handleQuestionSelect}
              getQuestionIcon={getQuestionIcon}
              theme={theme}
            />
          ))}
        </List>

        <Divider sx={{ my: 2 }} />
        
        <Stack spacing={1}>
          <Button
            variant="contained"
            fullWidth
            onClick={handleSubmitQuiz}
            startIcon={<CheckCircleOutlineIcon />}
            disabled={Object.keys(selectedAnswers).length === 0}
          >
            Submit Quiz
          </Button>
          <Button
            variant="outlined"
            fullWidth
            onClick={handleRetryQuiz}
            startIcon={<ReplayIcon />}
          >
            Retry Quiz
          </Button>
        </Stack>
      </Box>
    </Drawer>
  );

  const QuestionListItem = ({ question, index, currentQuestionIndexOnPage, handleQuestionSelect, getQuestionIcon, theme }) => {
    const questionRef = useRef(null);
  
    useEffect(() => {
      if (currentQuestionIndexOnPage === index && questionRef.current) {
        const el = questionRef.current;
        const rect = el.getBoundingClientRect();
        const isInView =
          rect.top >= 0 &&
          rect.bottom <= (window.innerHeight || document.documentElement.clientHeight);
    
        if (!isInView) {
          el.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
          });
        }
      }
    }, [currentQuestionIndexOnPage, index]);
    
  
    return (
      <ListItem key={question.id} disablePadding sx={{ mb: 1, p:0 }}>
        <ListItemButton
          ref={questionRef}
          selected={currentQuestionIndexOnPage === index}
          onClick={() => handleQuestionSelect(index)}
          sx={{
            borderRadius: 2,
            '&.Mui-selected': {
              backgroundColor: theme.palette.primary.main + '20',
            }
          }}
        >
          <ListItemIcon sx={{minWidth: '36px'}}>
            {getQuestionIcon(question)}
          </ListItemIcon>
          <ListItemText
            primary={`Question ${index + 1}`}
            secondary={
              <Typography variant="caption" noWrap>
                {question.question_text.length > 30 
                  ? question.question_text.substring(0, 30) + '...'
                  : question.question_text
                }
              </Typography>
            }
          />
        </ListItemButton>
      </ListItem>
    );
  };

  if (isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column'
      }}>
        <CircularProgress size={60} />
        <Typography sx={{ mt: 3, fontSize: '1.2rem' }}>
          Generating your quiz, please wait...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
          <Button variant="contained" onClick={() => navigate('/saved-files')}>
            Back to Saved Files
          </Button>
        </Paper>
      </Container>
    );
  }

  if (quizFinished) {
    const percentage = Math.round((score / allQuestions.length) * 100);

    
    // Export menu state
    
    const open = Boolean(anchorEl);
    
    const handleExportClick = (event) => {
      setAnchorEl(event.currentTarget);
    };
    
    const handleExportClose = () => {
      setAnchorEl(null);
    };
    
    const handleExport = (format) => {
      const quizData = { score, allQuestions, selectedAnswers, percentage };
      
      switch (format) {
        case 'pdf':
          exportToPDF(quizData);
          break;
        case 'excel':
          exportToExcel(quizData);
          break;
        case 'word':
          exportToWord(quizData);
          break;
        default:
          console.error('Unknown export format:', format);
          break;  
      }
      
      handleExportClose();
    };
    
    return (
      <>
        <Box
          sx={{
            p: 4,
            minHeight: '100vh',
          }}
        >
          <Container maxWidth="lg">
            <Paper elevation={6} sx={{ p: 6, textAlign: 'center', mb: 4 }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  margin: '0 auto 2rem',
                  backgroundColor: percentage >= 70 ? theme.palette.success.main : theme.palette.error.main,
                  fontSize: '2rem'
                }}
              >
                {percentage >= 70 ? '🎉' : '😅'}
              </Avatar>
              
              <Typography variant="h3" gutterBottom sx={{ fontWeight: 600 }}>
                Quiz Complete!
              </Typography>
              
              <Typography variant="h4" sx={{ color: theme.palette.primary.main, mb: 3 }}>
                Score: {score} / {allQuestions.length} ({percentage}%)
              </Typography>
  
              <LinearProgress
                variant="determinate"
                value={percentage}
                sx={{ 
                  height: 12, 
                  borderRadius: 6, 
                  mb: 4,
                  backgroundColor: theme.palette.background.default,
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: percentage >= 70 ? theme.palette.success.main : theme.palette.error.main,
                  }
                }}
              />
  
              <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap">
                <Button 
                  variant="contained" 
                  size="large"
                  startIcon={<RefreshIcon />}
                  onClick={handleRetryQuiz}
                >
                  Retry Quiz
                </Button>
                <Button 
                  variant="outlined" 
                  size="large"
                  startIcon={<HomeIcon />}
                  onClick={() => navigate('/saved-files')}
                >
                  Back to Files
                </Button>
                <Button 
                  variant="outlined" 
                  size="large"
                  startIcon={<DownloadIcon />}
                  onClick={handleExportClick}
                  color="secondary"
                >
                  Export Results
                </Button>
              </Stack>
              
              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleExportClose}
                MenuListProps={{
                  'aria-labelledby': 'export-button',
                }}
              >
                <MenuItem onClick={() => handleExport('pdf')}>
                  <ListItemIcon>
                    <PdfIcon color="error" />
                  </ListItemIcon>
                  <ListItemText>Export as PDF</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => handleExport('excel')}>
                  <ListItemIcon>
                    <ExcelIcon color="success" />
                  </ListItemIcon>
                  <ListItemText>Export as Excel</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => handleExport('word')}>
                  <ListItemIcon>
                    <WordIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText>Export as Word</ListItemText>
                </MenuItem>
              </Menu>
            </Paper>
  
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
              Detailed Results
            </Typography>
            
            <Grid container spacing={3}>
              {allQuestions.map((q, index) => {
                const isCorrect = selectedAnswers[q.id] === q.correct_answer;
                return (
                  <Grid item xs={12} key={q.id}>
                    <Card 
                      elevation={3}
                      sx={{ 
                        backgroundColor: isCorrect 
                          ? theme.palette.success.main + '10'
                          : theme.palette.error.main + '10',
                        border: `2px solid ${isCorrect ? theme.palette.success.main : theme.palette.error.main}20`
                      }}
                    >
                      <CardContent sx={{ p: 4 }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                          <Avatar
                            sx={{
                              bgcolor: isCorrect ? theme.palette.success.main : theme.palette.error.main,
                              mr: 2,
                              width: 32,
                              height: 32,
                              fontSize: '0.9rem'
                            }}
                          >
                            {index + 1}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
                              {q.question_text}
                            </Typography>
                            
                            <Chip 
                              label={`Page ${q.page_number || 1}`} 
                              size="small" 
                              sx={{ mb: 2 }}
                            />
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <Typography variant="body1" sx={{ mr: 2 }}>
                                <strong>Your answer:</strong> {q.options[selectedAnswers[q.id]] || 'Not answered'}
                              </Typography>
                              {isCorrect ? 
                                <CheckCircleOutlineIcon color="success" /> : 
                                <HighlightOffIcon color="error" />
                              }
                            </Box>
                            
                            {!isCorrect && (
                              <Typography variant="body1" sx={{ color: theme.palette.success.main, mb: 2 }}>
                                <strong>Correct answer:</strong> {q.options[q.correct_answer]}
                              </Typography>
                            )}
                            
                            {q.explanation && (
                              <Paper sx={{ p: 2, backgroundColor: theme.palette.background.default }}>
                                <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                                  <strong>Explanation:</strong> {q.explanation}
                                </Typography>
                              </Paper>
                            )}
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Container>
        </Box>
      </>
    );
  }

  if (isSubmitting) {
    return (
      <>
        {/* Overlay backdrop */}
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(26, 26, 26, 0.8)', // Dark backdrop matching your theme
            zIndex: 9998,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        />
        
        {/* Loading animation container */}
        <Box
          sx={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 9999,
            width: '300px',
            height: '300px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            backgroundColor: '#2D2D2D', // Paper color from your theme
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)', // Darker shadow for dark theme
            border: '1px solid #404040', // Divider color from your theme
            p: 4
          }}
        >
          <DotLottieReact
            src="https://lottie.host/65b5c6de-91c6-4f0a-8101-c9ed732b67c4/pDjobffM71.lottie"
            loop
            autoplay
            style={{
              width: '200px',
              height: '200px'
            }}
          />
          <Typography 
            variant="h6" 
            sx={{ 
              textAlign: 'center',
              color: '#FF6B35', // Primary carrot color from your theme
              fontWeight: 600
            }}
          >
            Submitting Quiz...
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              textAlign: 'center',
              color: '#B0B0B0' // Secondary text color from your theme
            }}
          >
            Please wait while we process your answers
          </Typography>
        </Box>
      </>
    );
  }

    // Add the intro guide component
  if (showIntro && !isLoading && !error && !quizFinished && !isSubmitting) {
    return (
      <>
        <LeftSidebar />
        <RightSidebar />
        <Box
          sx={{
            marginLeft: `280px`,
            marginRight: `${SIDEBAR_WIDTH}px`,
            minHeight: '80vh',
            mt: 2,
          }}
        >
          {/* Main content in the background */}
          <Container maxWidth="lg">
            <Paper elevation={6} sx={{ p: 2, minHeight: '70vh', opacity: 0.3 }}>
              {/* Existing content rendered with reduced opacity */}
              {/* ... */}
            </Paper>
          </Container>
        </Box>

        {/* Overlay backdrop */}
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(26, 26, 26, 0.85)',
            zIndex: 9998,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        />
        
        {/* Intro guide container */}
        <Box
          sx={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 9999,
            width: '90vw',
            maxWidth: '1200px',
            height: '80vh',
            maxHeight: '600px',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#2D2D2D',
            borderRadius: 4,
            boxShadow: '0 8px 40px rgba(0, 0, 0, 0.4)',
            border: '1px solid #404040',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <Box
            sx={{
              background: 'linear-gradient(135deg, #FF6B35 0%, #FF8A50 100%)',
              p: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <DotLottieReact
                src="https://lottie.host/3b3d5d9a-24cf-425e-8888-3004251a2aa0/hNj5nx9Y6g.lottie"
                loop
                autoplay
                style={{
                  width: '70px',
                  height: '70px'
                }}
              />
              <Typography 
                variant="h4" 
                sx={{ 
                  color: '#FFFFFF',
                  fontWeight: 700,
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}
              >
                Welcome to QuickyQuizy!
              </Typography>
            </Box>
            <Chip 
              label="Quick Guide" 
              sx={{ 
                backgroundColor: 'rgba(255,255,255,0.2)', 
                color: 'white',
                fontWeight: 600
              }} 
            />
          </Box>

          {/* Main Content Area */}
          <Box sx={{ flex: 1, display: 'flex', p: 4, gap: 4 }}>
            
            {/* Left Panel - Quiz Info */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  color: '#FF6B35',
                  fontWeight: 600,
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <QuizIcon />
                Quiz Information
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Paper 
                  sx={{ 
                    flex: 1,
                    p: 3, 
                    backgroundColor: 'rgba(255, 107, 53, 0.1)', 
                    border: '1px solid rgba(255, 107, 53, 0.3)',
                    borderRadius: 3,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 107, 53, 0.15)',
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  <Stack spacing={2} alignItems="center" textAlign="center">
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255, 107, 53, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Typography variant="h4" sx={{ color: '#FF6B35', fontWeight: 700 }}>
                        {quizPages.length}
                      </Typography>
                    </Box>
                    <Typography variant="h6" color="primary.main" fontWeight={600}>
                      Quiz Pages
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Navigate between pages using the left sidebar or arrow keys
                    </Typography>
                  </Stack>
                </Paper>
                
                <Paper 
                  sx={{ 
                    flex: 1,
                    p: 3, 
                    backgroundColor: 'rgba(255, 107, 53, 0.1)', 
                    border: '1px solid rgba(255, 107, 53, 0.3)',
                    borderRadius: 3,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 107, 53, 0.15)',
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  <Stack spacing={2} alignItems="center" textAlign="center">
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255, 107, 53, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Typography variant="h4" sx={{ color: '#FF6B35', fontWeight: 700 }}>
                        {allQuestions.length}
                      </Typography>
                    </Box>
                    <Typography variant="h6" color="primary.main" fontWeight={600}>
                      Total Questions
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Answer atleast one question to complete the quiz and check out with results
                    </Typography>
                  </Stack>
                </Paper>
              </Box>
            </Box>

            {/* Divider */}
            <Box
              sx={{
                width: '1px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                margin: '0 2px'
              }}
            />

            {/* Right Panel - Keyboard Shortcuts */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  color: '#FF6B35',
                  fontWeight: 600,
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <KeyboardIcon />
                Keyboard Shortcuts
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 3, height: '100%' }}>
                {/* Navigation Shortcuts */}
                <Paper 
                  sx={{ 
                    flex: 1,
                    p: 3, 
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 3
                  }}
                >
                  <Typography variant="subtitle1" sx={{ color: '#FFFFFF', fontWeight: 600, mb: 2 }}>
                    Navigation
                  </Typography>
                  <Stack spacing={2}>
                    {[
                      { key: '←', action: 'Previous Page' },
                      { key: '→', action: 'Next Page' },
                      { key: '↑', action: 'Previous Question' },
                      { key: '↓', action: 'Next Question' }
                    ].map(({ key, action }) => (
                      <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Chip 
                          label={key} 
                          size="small" 
                          sx={{ 
                            fontWeight: 'bold', 
                            minWidth: '40px',
                            backgroundColor: 'rgba(255, 107, 53, 0.2)',
                            color: '#FF6B35'
                          }} 
                        />
                        <Typography variant="body2" color="text.secondary">
                          {action}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Paper>
                
                {/* Answer Selection Shortcuts */}
                <Paper 
                  sx={{ 
                    flex: 1,
                    p: 3, 
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 3
                  }}
                >
                  <Typography variant="subtitle1" sx={{ color: '#FFFFFF', fontWeight: 600, mb: 2 }}>
                    Answer Selection
                  </Typography>
                  <Stack spacing={2}>
                    {[
                      { key: '1-9', action: 'Select by Number' },
                      { key: 'A-D', action: 'Select by Letter' },
                      { key: 'Space', action: 'Select First Option' }
                    ].map(({ key, action }) => (
                      <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Chip 
                          label={key} 
                          size="small" 
                          sx={{ 
                            fontWeight: 'bold', 
                            minWidth: '40px',
                            backgroundColor: 'rgba(255, 107, 53, 0.2)',
                            color: '#FF6B35'
                          }} 
                        />
                        <Typography variant="body2" color="text.secondary">
                          {action}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Paper>
              </Box>
            </Box>
          </Box>

          {/* Footer */}
          <Box
            sx={{
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'rgba(255, 255, 255, 0.02)'
            }}
          >
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#B0B0B0',
                ml:2.5,

              }}
            >
              💡 <strong>Pro Tip:</strong> Use the Sidebars to jump to specific questions. Yes, your progress is automatically saved!
            </Typography>
            
            <Button
              variant="contained"
              size="large"
              onClick={handleDismissIntro}
              sx={{ 
                minWidth: '200px',
                mr: 3,
                background: 'linear-gradient(135deg, #FF6B35 0%, #FF8A50 100%)',
                boxShadow: '0 4px 20px rgba(255, 107, 53, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #FF8A50 0%, #FF6B35 100%)',
                  boxShadow: '0 6px 25px rgba(255, 107, 53, 0.4)',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Start Quiz →
            </Button>
          </Box>
        </Box>
      </>
    );
  }

  return (
    <>
      <LeftSidebar />
      <RightSidebar />
      <Box
        sx={{
          marginLeft: `280px`,
          marginRight: `${SIDEBAR_WIDTH}px`,
          minHeight: '80vh',
          mt: 2,
        }}
      >
        <Container maxWidth="lg">
          <Paper elevation={6} sx={{ p: 2, minHeight: '70vh' }}>
            <Box sx={{ mb: 4 }}>
              <Chip 
                label={`Source Page ${currentQuizPage}`}
                color="primary"
                sx={{ mr: 2 }}
              />
              <Chip 
                label={`Question ${currentQuestionIndexOnPage + 1} of ${currentQuizPageQuestions.length}`}
                variant="outlined"
              />
            </Box>
            
            {currentQuestion ? (
              <Box sx={{ minHeight: '400px' }}>
                <FormControl component="fieldset" sx={{ width: '100%' }}>
                  <FormLabel component="legend" sx={{ 
                    typography: 'h5', 
                    mb: 1,
                    color: theme.palette.text.primary,
                    fontWeight: 500,
                    lineHeight: 1.4
                  }}>
                    {currentQuestion.question_text}
                  </FormLabel>
                  
                  <RadioGroup
                    value={selectedAnswers[currentQuestion.id] || ''}
                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                    sx={{ mt: 2 }}
                  >
                    {Object.entries(currentQuestion.options).map(([key, value]) => (
                      <Paper
                        key={key}
                        elevation={selectedAnswers[currentQuestion.id] === key ? 3 : 1}
                        sx={{
                          p: 2,
                          mb: 2,
                          border: selectedAnswers[currentQuestion.id] === key 
                            ? `2px solid ${theme.palette.primary.main}`
                            : `1px solid ${theme.palette.divider}`,
                          backgroundColor: selectedAnswers[currentQuestion.id] === key
                            ? theme.palette.primary.main + '10'
                            : 'transparent',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          '&:hover': {
                            backgroundColor: theme.palette.primary.main + '05',
                          }
                        }}
                      >
                        <FormControlLabel 
                          value={key}
                          control={<Radio />}
                          label={
                            <Typography variant="body1" sx={{ fontSize: '1.1rem', ml: 1 }}>
                              <strong>{key}.</strong> {value}
                            </Typography>
                          }
                          sx={{ margin: 0, width: '100%' }}
                        />
                      </Paper>
                    ))}
                  </RadioGroup>
                </FormControl>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="text.secondary">
                  No questions available on this page
                </Typography>
              </Box>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
              <Button
                variant="outlined"
                size="large"
                startIcon={<ArrowBackIcon />}
                onClick={() => {
                  if (currentQuestionIndexOnPage > 0) {
                    setCurrentQuestionIndexOnPage(currentQuestionIndexOnPage - 1);
                  } else {
                    const currentPageIndex = quizPages.indexOf(currentQuizPage);
                    if (currentPageIndex > 0) {
                      const prevPage = quizPages[currentPageIndex - 1];
                      setCurrentQuizPage(prevPage);
                      setCurrentQuestionIndexOnPage((questionsByPage[prevPage] || []).length - 1);
                    }
                  }
                }}
                disabled={currentQuestionIndexOnPage === 0 && quizPages.indexOf(currentQuizPage) === 0}
              >
                Previous
              </Button>
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowForwardIcon />}
                onClick={() => {
                  if (currentQuestionIndexOnPage < currentQuizPageQuestions.length - 1) {
                    setCurrentQuestionIndexOnPage(currentQuestionIndexOnPage + 1);
                  } else {
                    const currentPageIndex = quizPages.indexOf(currentQuizPage);
                    if (currentPageIndex < quizPages.length - 1) {
                      const nextPage = quizPages[currentPageIndex + 1];
                      setCurrentQuizPage(nextPage);
                      setCurrentQuestionIndexOnPage(0);
                    }
                  }
                }}
                disabled={
                  currentQuestionIndexOnPage >= currentQuizPageQuestions.length - 1 && 
                  quizPages.indexOf(currentQuizPage) >= quizPages.length - 1
                }
              >
                Next
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>
    </>
  );
};

export default QuestionsPage;