import './globals.css'

export const metadata = {
  title: 'FocusFlow - Study Smarter. Not Harder.',
  description: 'AI-powered adaptive study system designed for students. Break overwhelming assignments into small actionable tasks and gamify your productivity.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        <script dangerouslySetInnerHTML={{__html:'window.addEventListener("error",function(e){if(e.error instanceof DOMException&&e.error.name==="DataCloneError"&&e.message&&e.message.includes("PerformanceServerTiming")){e.stopImmediatePropagation();e.preventDefault()}},true);'}} />
      </head>
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  )
}