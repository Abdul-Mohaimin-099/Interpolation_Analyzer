import React, { useState } from 'react';

function LearningHub() {
  const [expandedMethod, setExpandedMethod] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [answers, setAnswers] = useState({});
  const [showScore, setShowScore] = useState(false);
  const [score, setScore] = useState(0);

  const questions = [
    {
      id: 1,
      question: "What is Linear Interpolation?",
      options: [
        "A method that fits a straight line between two points",
        "A method that uses cubic polynomials",
        "A method that uses exponential functions",
        "A method that uses trigonometric functions"
      ],
      correctAnswer: 0
    },
    {
      id: 2,
      question: "Which interpolation method generally provides the smoothest curve?",
      options: [
        "Linear Interpolation",
        "Newton Forward Interpolation",
        "Cubic Spline Interpolation",
        "Newton Backward Interpolation"
      ],
      correctAnswer: 2
    },
    {
      id: 3,
      question: "When is Newton Forward Interpolation most suitable?",
      options: [
        "When data points are equally spaced and we're interpolating near the end",
        "When data points are equally spaced and we're interpolating near the beginning",
        "When data points are randomly spaced",
        "When we need perfect accuracy"
      ],
      correctAnswer: 1
    },
    {
      id: 4,
      question: "What is the main advantage of Divided Differences method?",
      options: [
        "It's the fastest method",
        "It works with both equally and unequally spaced data",
        "It always gives the most accurate results",
        "It uses the least memory"
      ],
      correctAnswer: 1
    },
    {
      id: 5,
      question: "Which statement about Cubic Spline interpolation is true?",
      options: [
        "It's the simplest interpolation method",
        "It's discontinuous at the knot points",
        "It ensures continuity up to the second derivative",
        "It only works with three data points"
      ],
      correctAnswer: 2
    },
    {
      id: 6,
      question: "What is a key limitation of Linear Interpolation?",
      options: [
        "It requires too much computational power",
        "It can only work with positive numbers",
        "It doesn't preserve the smoothness of the original function",
        "It can only interpolate between two points at a time"
      ],
      correctAnswer: 2
    },
    {
      id: 7,
      question: "In Newton's Divided Differences method, what happens if two x-values are identical?",
      options: [
        "The method still works normally",
        "The calculation results in a division by zero error",
        "The method automatically skips those points",
        "The interpolation becomes more accurate"
      ],
      correctAnswer: 1
    },
    {
      id: 8,
      question: "What is the primary benefit of using Cubic Spline over Linear Interpolation?",
      options: [
        "It's computationally less expensive",
        "It provides smoother transitions between points",
        "It's easier to implement",
        "It requires fewer data points"
      ],
      correctAnswer: 1
    },
    {
      id: 9,
      question: "Which interpolation method is most suitable for real-time applications with limited computational resources?",
      options: [
        "Cubic Spline Interpolation",
        "Newton's Divided Differences",
        "Linear Interpolation",
        "Newton Forward Interpolation"
      ],
      correctAnswer: 2
    },
    {
      id: 10,
      question: "What is the main difference between Newton Forward and Newton Backward Interpolation?",
      options: [
        "Forward is more accurate than Backward",
        "Forward uses future points while Backward uses previous points",
        "Forward is faster than Backward",
        "Forward uses less memory than Backward"
      ],
      correctAnswer: 1
    }
  ];

  const handleAnswerSelect = (questionId, answerIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const handleSubmitQuiz = () => {
    const totalScore = questions.reduce((acc, question) => {
      return acc + (answers[question.id] === question.correctAnswer ? 1 : 0);
    }, 0);
    setScore(totalScore);
    setShowScore(true);
  };

  const restartQuiz = () => {
    setAnswers({});
    setScore(0);
    setShowScore(false);
  };

  const renderQuiz = () => {
    if (showScore) {
      return (
        <div className="bg-white/80 rounded-xl shadow-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-[#333333] mb-4">Quiz Complete!</h3>
          <p className="text-xl text-[#333333] mb-6">
            You scored {score} out of {questions.length}
          </p>
          <div className="text-[#333333]/70 mb-8">
            {score === questions.length && "Perfect score! You're an interpolation expert! 🎉"}
            {score >= questions.length * 0.7 && score < questions.length && "Great job! You have a solid understanding! 👏"}
            {score >= questions.length * 0.4 && score < questions.length * 0.7 && "Good effort! Keep learning! 👍"}
            {score < questions.length * 0.4 && "Keep studying! You'll get better! 💪"}
          </div>
          <div className="flex justify-center gap-4">
            <button
              onClick={restartQuiz}
              className="px-6 py-3 bg-[#ADD8E6] text-[#333333] rounded-lg font-medium hover:bg-[#87CEEB] transition-all duration-300 shadow-md"
            >
              Try Again
            </button>
            <button
              onClick={() => {
                setShowQuiz(false);
                restartQuiz();
              }}
              className="px-6 py-3 bg-[#FF6B6B] text-white rounded-lg font-medium hover:bg-[#FF4F4F] transition-all duration-300 shadow-md"
            >
              Back to Learning Hub
            </button>
          </div>
          
          {/* Show correct answers */}
          <div className="mt-8 text-left">
            <h4 className="text-xl font-semibold text-[#333333] mb-4">Review Your Answers:</h4>
            <div className="space-y-6">
              {questions.map((q) => (
                <div key={q.id} className="bg-white/50 rounded-lg p-4">
                  <p className="font-medium text-[#333333] mb-2">{q.question}</p>
                  <div className="grid gap-2">
                    {q.options.map((option, idx) => (
                      <div
                        key={idx}
                        className={`p-2 rounded ${
                          idx === q.correctAnswer
                            ? 'bg-green-100 text-green-800'
                            : idx === answers[q.id]
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-50 text-gray-800'
                        }`}
                      >
                        {option}
                        {idx === q.correctAnswer && ' ✓'}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white/80 rounded-xl shadow-lg p-8">
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-[#333333] mb-6">Interpolation Methods Quiz</h3>
          <p className="text-[#333333]/70 mb-8">
            Test your knowledge of different interpolation methods. Select one answer for each question
            and submit when you're ready.
          </p>
          
          <div className="space-y-8">
            {questions.map((q) => (
              <div key={q.id} className="border-b border-[#ADD8E6]/30 pb-6 last:border-0">
                <p className="font-medium text-[#333333] mb-4">
                  {q.id}. {q.question}
                </p>
                <div className="space-y-3">
                  {q.options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAnswerSelect(q.id, idx)}
                      className={`w-full p-3 text-left rounded-lg transition-all duration-300 ${
                        answers[q.id] === idx
                          ? 'bg-[#ADD8E6] text-[#333333] border-2 border-[#87CEEB]'
                          : 'bg-white/50 hover:bg-[#ADD8E6]/30 text-[#333333] border-2 border-transparent'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex justify-between mt-8">
          <button
            onClick={() => setShowQuiz(false)}
            className="px-6 py-3 bg-[#FF6B6B] text-white rounded-lg font-medium hover:bg-[#FF4F4F] transition-all duration-300 shadow-md"
          >
            Exit Quiz
          </button>
          <button
            onClick={handleSubmitQuiz}
            disabled={Object.keys(answers).length !== questions.length}
            className="px-6 py-3 bg-[#ADD8E6] text-[#333333] rounded-lg font-medium hover:bg-[#87CEEB] transition-all duration-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit Quiz
          </button>
        </div>
      </div>
    );
  };

  const learningResources = [
    {
      id: 'linear',
      title: 'Linear Interpolation',
      description: 'Learn about the simplest form of interpolation - linear interpolation.',
      category: 'basic',
      resources: {
        videos: [
          {
            title: 'Numerical Method Bangla Tutorial 13 : Linear Interpolation',
            url: 'https://www.youtube.com/embed/4_ZhuvEVoyk',
            duration: '07:54',
            author: 'Learn with Ifad'
          },
          {
            title: 'Linear Interpolation',
            url: 'https://www.youtube.com/embed/xwmcVd85VRE',
            duration: '07:19',
            author: 'David Lampert'
          }
        ],
        articles: [
          {
            title: 'Linear Interpolation Formula',
            url: 'https://www.geeksforgeeks.org/maths/linear-interpolation-formula/',
            readTime: '15 min',
            source: 'GeeksForGeeks'
          },
          {
            title: 'Linear Interpolation Formula',
            url: 'https://byjus.com/linear-interpolation-formula/',
            readTime: '10 min',
            source: 'BYJUS'
          }
        ],
        additionalResources: []
      }
    },
    {
      id: 'spline',
      title: 'Spline Interpolation',
      description: 'Understand how cubic splines create smooth curves through data points.',
      category: 'advanced',
      resources: {
        videos: [
          {
            title: 'Numerical Methods -Cubic Spline Interpolation',
            url: 'https://www.youtube.com/embed/mEs9jkB-iUw',
            duration: '42:34',
            author: 'PHYSICS CLASS ROOM'
          },
          {
            title: 'Spline Interpolation In Python (Linear, Quadratic, Cubic, etc…) | Numerical Methods',
            url: 'https://www.youtube.com/embed/9R5UxtJQNNg',
            duration: '08:01',
            author: 'StudySession'
          }
        ],
        articles: [
          {
            title: 'Cubic spline Interpolation',
            url: 'https://www.geeksforgeeks.org/machine-learning/cubic-spline-interpolation/',
            readTime: '15 min',
            source: 'GeeksForGeeks'
          },
          {
            title: 'Spline Interpolation',
            url: 'http://mathforcollege.com/nm/mws/gen/05inp/mws_gen_inp_ppt_spline.pdf',
            readTime: '30 min',
            source: 'Emath for college'
          }
        ]
      }
    },
    {
      id: 'newton',
      title: 'Newton Interpolation Methods',
      description: 'Deep dive into Newton Forward and Backward interpolation techniques.',
      category: 'advanced',
      resources: {
        videos: [
          {
            title: 'Newtons Forward Interpolation Example in Bangla ',
            url: 'https://www.youtube.com/embed/1p4mnM7uEhQ',
            duration: '07:20',
            author: 'Compiler Error -by Ikram'
          },
          {
            title: 'Newtons Backward Interpolation Example in Bangla',
            url: 'https://www.youtube.com/embed/aD6BbkuVnwk',
            duration: '06:44',
            author: 'Compiler Error -by Ikram'
          }
        ],
        articles: [
          {
            title: 'Newton Forward And Backward Interpolation',
            url: 'https://www.geeksforgeeks.org/dsa/newton-forward-backward-interpolation/',
            readTime: '20 min',
            source: 'GeeksForGeeks'
          },
          {
            title: 'Newtons forward & backward interpolation',
            url: 'https://www.slideshare.net/slideshow/newtons-forward-backward-interpolation-134662616/134662616',
            readTime: '25 min',
            source: 'SlideShare'
          }
        ]
      }
    },
    {
      id: 'divided',
      title: 'Divided Differences',
      description: 'Master the concept of divided differences in polynomial interpolation.',
      category: 'advanced',
      resources: {
        videos: [
          {
            title: 'Newtons Divided Differences Formula Example in Bangla ',
            url: 'https://www.youtube.com/embed/SsJfruLt0BE',
            duration: '10:08',
            author: 'Compiler Error -by Ikram'
          }
        ],
        articles: [
          {
            title: 'Newtons Divided Difference Interpolation Formula',
            url: 'https://www.geeksforgeeks.org/dsa/newtons-divided-difference-interpolation-formula/',
            readTime: '15 min',
            source: 'GeeksForGeeks'
          }
        ]
      }
    }
  ];

  const handleMethodClick = (methodId) => {
    setExpandedMethod(expandedMethod === methodId ? null : methodId);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-center text-[#333333] mb-8">Learning Hub</h2>
      
      <div className="flex justify-center mb-8">
        <button
          onClick={() => setShowQuiz(!showQuiz)}
          className="px-6 py-3 bg-[#ADD8E6] text-[#333333] rounded-lg font-medium hover:bg-[#87CEEB] transition-all duration-300 shadow-md"
        >
          {showQuiz ? 'Back to Learning Materials' : 'Take a Quiz'}
        </button>
      </div>

      {showQuiz ? (
        renderQuiz()
      ) : (
        <>
          <p className="text-center text-[#333333]/70 mb-12 max-w-2xl mx-auto">
            Explore our comprehensive collection of educational resources for each interpolation method.
            Watch video tutorials, read articles, and enhance your understanding with practical exercises.
          </p>

          <div className="space-y-6">
            {learningResources.map((method) => (
              <div
                key={method.id}
                className="bg-white/80 rounded-xl shadow-lg border border-[#ADD8E6]/30 overflow-hidden"
              >
                <button
                  onClick={() => handleMethodClick(method.id)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#ADD8E6]/10 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <h3 className="text-xl font-semibold text-[#333333]">{method.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      method.category === 'basic' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {method.category.charAt(0).toUpperCase() + method.category.slice(1)}
                    </span>
                  </div>
                  <svg
                    className={`w-6 h-6 transform transition-transform ${
                      expandedMethod === method.id ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {expandedMethod === method.id && (
                  <div className="px-6 pb-6">
                    <p className="text-[#333333]/70 mb-6">{method.description}</p>
                    
                    {/* Video Tutorials Section */}
                    <div className="mb-8">
                      <h4 className="text-lg font-semibold text-[#333333] mb-4">Video Tutorials</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {method.resources.videos.map((video, index) => (
                          <div key={index} className="bg-white/50 rounded-lg overflow-hidden shadow">
                            <div className="aspect-video">
                              <iframe
                                src={video.url}
                                title={video.title}
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              ></iframe>
                            </div>
                            <div className="p-4">
                              <h5 className="font-medium text-[#333333] mb-2">{video.title}</h5>
                              <div className="flex items-center text-sm text-[#333333]/70">
                                <span>{video.author}</span>
                                <span className="mx-2">•</span>
                                <span>{video.duration}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Articles Section */}
                    {method.resources.articles && method.resources.articles.length > 0 && (
                      <div className="mb-8">
                        <h4 className="text-lg font-semibold text-[#333333] mb-4">Articles & Readings</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {method.resources.articles.map((article, index) => (
                            <a
                              key={index}
                              href={article.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-white/50 rounded-lg p-4 hover:bg-[#ADD8E6]/10 transition-colors"
                            >
                              <h5 className="font-medium text-[#333333] mb-2">{article.title}</h5>
                              <div className="flex items-center text-sm text-[#333333]/70">
                                <span>{article.source}</span>
                                <span className="mx-2">•</span>
                                <span>{article.readTime} read</span>
                              </div>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Additional Resources Section */}
                    {method.resources.additionalResources && method.resources.additionalResources.length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold text-[#333333] mb-4">Additional Resources</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {method.resources.additionalResources.map((resource, index) => (
                            <a
                              key={index}
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-white/50 rounded-lg p-4 hover:bg-[#ADD8E6]/10 transition-colors"
                            >
                              <h5 className="font-medium text-[#333333] mb-2">{resource.title}</h5>
                              <span className="text-sm text-[#333333]/70 capitalize">{resource.type}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default LearningHub; 