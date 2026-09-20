const PortfolioData = {
  name: "Khushi Donda",

  navLinks: [
    { name: "Home", path: "/" },
    { name: "Projects", path: "/projects" },
    { name: "Tasks", path: "/tasks" },
    { name: "Login", path: "/login" },
    { name: "Contact", path: "/contact" }
  ],
  
  about: {
    heading : "About Me",
    description: "I am a Information Technology student passionate about Web Development, React, and Data Science."
  },

  skills: {
    heading: "My Skills",
    skillsList: [
    "HTML" ,
    "CSS",
    "JavaScript",
    "React",
    "Python",
    "Git",
    "GitHub"]
  },

  projects: [
    {
      id: 1,
      title: "Student Portfolio",
      description: "Portfolio website built using React."
    },
    {
      id: 2,
      title: "Weather App",
      description: "Weather application using API."
    },
    {
      id: 3,
      title: "Student Management System",
      description: "CRUD application using React."
    }
  ],
  Footer: {
    heading: "Contact Me",
    email: "khushi@gmail.com",
    year: "2026"
  }
};

export default PortfolioData;