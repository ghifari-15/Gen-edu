export const sampleQuizzes = [
  {
    id: "1",
    title: "Machine Learning Fundamentals",
    description: "Basic concepts of machine learning and artificial intelligence",
    difficulty: "Medium",
    questions: [
      {
        id: "q1",
        text: "What is supervised learning?",
        options: [
          "Learning without labeled data",
          "Learning with labeled data",
          "Learning through reinforcement",
          "Learning through clustering",
        ],
        correctAnswer: 1,
      },
      {
        id: "q2",
        text: "Which of the following is a classification algorithm?",
        options: ["Linear Regression", "K-means", "Random Forest", "Principal Component Analysis"],
        correctAnswer: 2,
      },
      {
        id: "q3",
        text: "What is the purpose of cross-validation?",
        options: [
          "To evaluate model performance",
          "To increase model complexity",
          "To reduce training time",
          "To visualize data",
        ],
        correctAnswer: 0,
      },
    ],
    totalQuestions: 15,
    date: "2024-04-05",
  },
  {
    id: "2",
    title: "Web Development Basics",
    description: "Introduction to HTML, CSS, and JavaScript",
    difficulty: "Easy",
    questions: [
      {
        id: "q1",
        text: "What does HTML stand for?",
        options: [
          "Hyper Text Markup Language",
          "High Tech Modern Language",
          "Hyper Transfer Markup Language",
          "Home Tool Markup Language",
        ],
        correctAnswer: 0,
      },
      {
        id: "q2",
        text: "Which property is used to change the background color in CSS?",
        options: ["color", "bgcolor", "background-color", "background"],
        correctAnswer: 2,
      },
      {
        id: "q3",
        text: "Which of the following is a JavaScript framework?",
        options: ["Django", "Flask", "Ruby on Rails", "React"],
        correctAnswer: 3,
      },
    ],
    totalQuestions: 20,
    date: "2024-04-04",
  },
  {
    id: "3",
    title: "Data Structures",
    description: "Common data structures and their implementations",
    difficulty: "Hard",
    questions: [
      {
        id: "q1",
        text: "Which data structure uses LIFO principle?",
        options: ["Queue", "Stack", "Linked List", "Tree"],
        correctAnswer: 1,
      },
      {
        id: "q2",
        text: "What is the time complexity of binary search?",
        options: ["O(1)", "O(n)", "O(log n)", "O(n log n)"],
        correctAnswer: 2,
      },
      {
        id: "q3",
        text: "Which of the following is not a linear data structure?",
        options: ["Array", "Linked List", "Queue", "Tree"],
        correctAnswer: 3,
      },
    ],
    totalQuestions: 25,
    date: "2024-04-03",
  },
]
