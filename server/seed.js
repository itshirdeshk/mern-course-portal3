import bcrypt from "bcryptjs"
import { connectDB } from "./config/db.js"
import { User } from "./models/User.js"
import { Course } from "./models/Course.js"
import mongoose from "mongoose"

async function run() {
  await connectDB()

  const adminEmail = "admin@learnforge.dev"
  const studentEmail = "student@learnforge.dev"

  const adminHash = await bcrypt.hash("admin123", 10)
  const studentHash = await bcrypt.hash("student123", 10)

  await User.updateOne(
    { email: adminEmail },
    { $setOnInsert: { name: "Portal Administrator", email: adminEmail, passwordHash: adminHash, role: "admin" } },
    { upsert: true },
  )
  await User.updateOne(
    { email: studentEmail },
    { $setOnInsert: { name: "Alex Morgan", email: studentEmail, passwordHash: studentHash, role: "student" } },
    { upsert: true },
  )

  const courses = [
    {
      title: "Modern Web Development Foundations",
      slug: "modern-web-development-foundations",
      subtitle: "Build A Rock-Solid Base For A Full-Stack Career",
      description:
        "A Guided Path Through The Core Building Blocks Of Modern Web Development. Watch Each Lecture In Order, Pass The Final Assessment, Share Your Achievement On LinkedIn, And Unlock Your Verified Certificate.",
      category: "Web Development",
      level: "Beginner",
      instructor: "Jordan Lee",
      companyName: "LearnForge",
      coverImage: "",
      published: true,
      lectures: [
        {
          title: "Welcome And Course Roadmap",
          description: "An Overview Of What You Will Learn And How The Certification Works.",
          videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
          durationSeconds: 15,
          order: 0,
        },
        {
          title: "How The Web Works",
          description: "Clients, Servers, And The Request Response Cycle Explained Clearly.",
          videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
          durationSeconds: 15,
          order: 1,
        },
        {
          title: "Structuring Content With HTML",
          description: "Semantic Markup And Accessibility Fundamentals.",
          videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
          durationSeconds: 60,
          order: 2,
        },
        {
          title: "Styling And Layout Essentials",
          description: "Modern CSS Techniques For Responsive Interfaces.",
          videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
          durationSeconds: 15,
          order: 3,
        },
      ],
      quiz: {
        passingScore: 70,
        questions: [
          {
            prompt: "What Does A Web Server Primarily Do?",
            options: [
              "Respond To Client Requests With Resources",
              "Render Images On The Screen",
              "Store Passwords In Plain Text",
              "Replace The Need For A Browser",
            ],
            correctIndex: 0,
          },
          {
            prompt: "Which Tag Best Describes Primary Page Content?",
            options: ["<div>", "<main>", "<span>", "<b>"],
            correctIndex: 1,
          },
          {
            prompt: "Which Approach Makes A Layout Responsive?",
            options: [
              "Fixed Pixel Widths Everywhere",
              "Using Flexbox And Relative Units",
              "Disabling The Viewport",
              "Only Absolute Positioning",
            ],
            correctIndex: 1,
          },
          {
            prompt: "Why Is Semantic HTML Important?",
            options: [
              "It Improves Accessibility And Meaning",
              "It Makes Files Larger",
              "It Removes The Need For CSS",
              "It Slows Down The Page",
            ],
            correctIndex: 0,
          },
        ],
      },
    },
    {
      title: "JavaScript Essentials",
      slug: "javascript-essentials",
      subtitle: "Master The Language That Powers The Web",
      description:
        "Learn JavaScript From Variables To Asynchronous Programming. Complete Every Lecture In Sequence, Pass The Quiz, Share On LinkedIn, And Earn Your Certificate.",
      category: "Programming",
      level: "Beginner",
      instructor: "Priya Sharma",
      companyName: "LearnForge",
      coverImage: "",
      published: true,
      lectures: [
        {
          title: "Variables And Data Types",
          description: "Understanding let, const, And The Core JavaScript Data Types.",
          videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
          durationSeconds: 15,
          order: 0,
        },
        {
          title: "Functions And Scope",
          description: "How Functions Work And How Scope Controls Variable Access.",
          videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
          durationSeconds: 15,
          order: 1,
        },
        {
          title: "Arrays And Objects",
          description: "Working With Collections And Structured Data.",
          videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
          durationSeconds: 15,
          order: 2,
        },
        {
          title: "Asynchronous JavaScript",
          description: "Promises, async/await, And Handling API Calls.",
          videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
          durationSeconds: 15,
          order: 3,
        },
      ],
      quiz: {
        passingScore: 70,
        questions: [
          {
            prompt: "Which Keyword Declares A Block-Scoped Variable That Cannot Be Reassigned?",
            options: ["var", "let", "const", "function"],
            correctIndex: 2,
          },
          {
            prompt: "What Does The typeof Operator Return For An Array?",
            options: ["array", "object", "list", "collection"],
            correctIndex: 1,
          },
          {
            prompt: "Which Keyword Pauses Execution Until A Promise Resolves?",
            options: ["await", "yield", "pause", "hold"],
            correctIndex: 0,
          },
          {
            prompt: "How Do You Access The First Element Of An Array Named items?",
            options: ["items(0)", "items[1]", "items[0]", "items.first"],
            correctIndex: 2,
          },
        ],
      },
    },
    {
      title: "React Fundamentals",
      slug: "react-fundamentals",
      subtitle: "Build Interactive User Interfaces With Confidence",
      description:
        "A Practical Introduction To React: Components, Props, State, And Hooks. Watch Lectures In Order, Pass The Assessment, Share On LinkedIn, And Unlock Your Certificate.",
      category: "Web Development",
      level: "Intermediate",
      instructor: "Marcus Chen",
      companyName: "LearnForge",
      coverImage: "",
      published: true,
      lectures: [
        {
          title: "Thinking In Components",
          description: "How React Breaks UIs Into Reusable Pieces.",
          videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4",
          durationSeconds: 15,
          order: 0,
        },
        {
          title: "Props And State",
          description: "Passing Data Down And Managing Local Component State.",
          videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
          durationSeconds: 15,
          order: 1,
        },
        {
          title: "Handling Events And Forms",
          description: "Responding To User Input The React Way.",
          videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
          durationSeconds: 15,
          order: 2,
        },
        {
          title: "Introduction To Hooks",
          description: "useState And useEffect For Modern Function Components.",
          videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
          durationSeconds: 15,
          order: 3,
        },
      ],
      quiz: {
        passingScore: 70,
        questions: [
          {
            prompt: "What Is Used To Pass Data From A Parent Component To A Child?",
            options: ["State", "Props", "Refs", "Context Only"],
            correctIndex: 1,
          },
          {
            prompt: "Which Hook Manages Local State In A Function Component?",
            options: ["useEffect", "useMemo", "useState", "useRef"],
            correctIndex: 2,
          },
          {
            prompt: "When Does useEffect Run By Default?",
            options: [
              "Before The First Render Only",
              "After Every Render",
              "Only On Unmount",
              "Never Automatically",
            ],
            correctIndex: 1,
          },
          {
            prompt: "What Must Each Item In A Rendered List Have?",
            options: ["A Unique key Prop", "An id Attribute", "A ref", "An inline Style"],
            correctIndex: 0,
          },
        ],
      },
    },
  ]

  for (const data of courses) {
    const exists = await Course.findOne({ slug: data.slug })
    if (!exists) {
      await Course.create(data)
      console.log("[v0] Created course:", data.slug)
    } else {
      console.log("[v0] Course already exists, skipping:", data.slug)
    }
  }

  console.log("[v0] Seed complete. Admin:", adminEmail, "/ admin123  Student:", studentEmail, "/ student123")
  await mongoose.connection.close()
  process.exit(0)
}

run().catch((err) => {
  console.log("[v0] seed error:", err.message)
  process.exit(1)
})
