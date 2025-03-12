import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from "@/components/ui/toaster"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { TooltipProvider } from "@/components/ui/tooltip"

// Pages
import Index from "./pages/Index"
import { Auth } from "./pages/Auth"
import DeveloperSignup from "./pages/DeveloperSignup"
import FounderSignup from "./pages/FounderSignup"
import FounderDashboard from './pages/FounderDashboard'
import DeveloperDashboard from './pages/DeveloperDashboard'
import DeveloperStorage from './pages/DeveloperStorage';
import AboutUs from './pages/AboutUs'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth/developer" element={<Auth userType="developer" />} />
            <Route path="/auth/founder" element={<Auth userType="founder" />} />
            <Route path="/signup/developer" element={<DeveloperSignup />} />
            <Route path="/signup/founder" element={<FounderSignup />} />
            <Route path="/founderdashboard" element={<FounderDashboard />} />
            <Route path="/developerdashboard" element={<DeveloperDashboard />} />            
            <Route path="/developerstorage" element={<DeveloperStorage />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  )
}


export default App
