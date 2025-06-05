"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ThemeProvider } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowRight,
  ArrowLeft,
  Send,
  Wallet,
  History,
  User,
  Globe,
  Clock,
  CheckCircle,
  Camera,
  Upload,
  CreditCard,
  Smartphone,
  Eye,
  EyeOff,
  Moon,
  Sun,
  Bell,
  Shield,
  FileText,
  Settings,
  TrendingUp,
  Filter,
  Search,
  Plus,
  Zap,
  Fingerprint,
  ChevronRight,
  Home,
  Info,
} from "lucide-react"
import { useTheme } from "next-themes"

type Screen =
  | "welcome"
  | "signup"
  | "kyc-upload"
  | "kyc-selfie"
  | "dashboard"
  | "send-country"
  | "send-amount"
  | "send-rate"
  | "send-beneficiary"
  | "send-funding"
  | "send-confirm"
  | "send-success"
  | "history"
  | "profile"

const countries = [
  { code: "US", name: "United States", currency: "USD", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", currency: "GBP", flag: "🇬🇧" },
  { code: "NG", name: "Nigeria", currency: "NGN", flag: "🇳🇬" },
  { code: "KE", name: "Kenya", currency: "KES", flag: "🇰🇪" },
  { code: "IN", name: "India", currency: "INR", flag: "🇮🇳" },
  { code: "PH", name: "Philippines", currency: "PHP", flag: "🇵🇭" },
]

const transactions = [
  {
    id: "1",
    recipient: "John Doe",
    amount: 500,
    currency: "USD",
    toCurrency: "NGN",
    toAmount: 775000,
    status: "completed",
    date: "2024-01-15",
    country: "🇺🇸",
  },
  {
    id: "2",
    recipient: "Sarah Wilson",
    amount: 250,
    currency: "USD",
    toCurrency: "KES",
    toAmount: 37500,
    status: "pending",
    date: "2024-01-14",
    country: "🇰🇪",
  },
  {
    id: "3",
    recipient: "Mike Johnson",
    amount: 1000,
    currency: "USD",
    toCurrency: "INR",
    toAmount: 83000,
    status: "completed",
    date: "2024-01-12",
    country: "🇮🇳",
  },
]

// Mock exchange rates API response
const mockExchangeRates = {
  USD: 0.00065,
  GBP: 0.00051,
  EUR: 0.00059,
  CAD: 0.00088,
}

export default function BridgeApp() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("welcome")
  const [kycProgress, setKycProgress] = useState(0)
  const [sendData, setSendData] = useState({
    country: "",
    countryName: "",
    countryCurrency: "",
    countryFlag: "",
    amount: "",
    rate: 0,
    beneficiary: "",
    funding: "",
    fee: 0,
  })
  const [rateCountdown, setRateCountdown] = useState(30)
  const [showPassword, setShowPassword] = useState(false)
  const [inputAmount, setInputAmount] = useState("")
  const [convertedAmount, setConvertedAmount] = useState("")
  const { theme, setTheme } = useTheme()

  // Calculate fee based on amount (1.5% of the amount)
  const calculateFee = useCallback((amount: string) => {
    const numAmount = Number.parseFloat(amount) || 0
    return numAmount * 0.015
  }, [])

  // Calculate converted amount based on selected country and input amount
  const calculateConvertedAmount = useCallback(
    (amount: string, country: string) => {
      const numAmount = Number.parseFloat(amount) || 0
      const selectedCountry = countries.find((c) => c.code === country)

      if (!selectedCountry) return ""

      // Get exchange rate for the selected country's currency
      const rate = mockExchangeRates[selectedCountry.currency as keyof typeof mockExchangeRates] || 1

      // For sending from NGN to other currencies, we divide by the rate
      const converted = numAmount * rate

      return converted.toFixed(2)
    },
    [mockExchangeRates],
  )

  // Update converted amount when input amount or country changes
  useEffect(() => {
    if (sendData.country && inputAmount) {
      const converted = calculateConvertedAmount(inputAmount, sendData.country)
      setConvertedAmount(converted)

      // Update fee
      const fee = calculateFee(inputAmount)
      setSendData((prev) => ({
        ...prev,
        fee,
      }))
    }
  }, [inputAmount, sendData.country, calculateConvertedAmount, calculateFee])

  useEffect(() => {
    if (currentScreen === "send-rate" && rateCountdown > 0) {
      const timer = setTimeout(() => setRateCountdown(rateCountdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [currentScreen, rateCountdown])

  const handleAmountChange = (value: string) => {
    // Only allow numbers and a single decimal point
    const regex = /^[0-9]*\.?[0-9]*$/
    if (value === "" || regex.test(value)) {
      setInputAmount(value)
      setSendData((prev) => ({
        ...prev,
        amount: value,
      }))
    }
  }

  const handleKeypadPress = (key: string | number) => {
    if (key === "⌫") {
      // Backspace - remove the last character
      handleAmountChange(inputAmount.slice(0, -1))
    } else if (key === "." && inputAmount.includes(".")) {
      // Prevent multiple decimal points
      return
    } else {
      // Add the key to the input
      handleAmountChange(inputAmount + key)
    }
  }

  const handleQuickAmount = (amount: number) => {
    handleAmountChange(amount.toString())
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: { duration: 0.3 },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  }

  const WelcomeScreen = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900"
    >
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
        className="mb-8"
      >
        <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl">
          <Zap className="w-12 h-12 text-white" />
        </div>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="text-4xl font-bold text-gray-900 dark:text-white mb-4 text-center"
      >
        Bridge
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.6 }}
        className="text-lg text-gray-600 dark:text-gray-300 text-center mb-12 max-w-sm"
      >
        Send money across borders instantly, securely, and at the best rates
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.6 }}
        className="w-full max-w-sm space-y-4"
      >
        <Button
          onClick={() => setCurrentScreen("signup")}
          className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
        >
          Get Started
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>

        <Button variant="outline" className="w-full h-14 text-lg font-semibold border-2 backdrop-blur-sm">
          Sign In
        </Button>
      </motion.div>
    </motion.div>
  )

  const SignupScreen = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="min-h-screen p-6 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900"
    >
      <div className="max-w-md mx-auto pt-12">
        <Button variant="ghost" onClick={() => setCurrentScreen("welcome")} className="mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <motion.div variants={cardVariants} className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Create Account</h1>
          <p className="text-gray-600 dark:text-gray-300">Join millions who trust Bridge for their money transfers</p>
        </motion.div>

        <motion.div variants={cardVariants}>
          <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-xl">
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email or Phone</Label>
                <Input id="email" placeholder="Enter your email or phone number" className="h-12 text-lg" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    className="h-12 text-lg pr-12"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-2 h-8 w-8 p-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <Button
                onClick={() => {
                  setKycProgress(25)
                  setCurrentScreen("kyc-upload")
                }}
                className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Continue
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>

              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )

  const KYCUploadScreen = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="min-h-screen p-6 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900"
    >
      <div className="max-w-md mx-auto pt-12">
        <Button variant="ghost" onClick={() => setCurrentScreen("signup")} className="mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Verify Identity</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">Upload a government-issued ID to secure your account</p>
          <Progress value={kycProgress} className="h-2" />
          <p className="text-sm text-gray-500 mt-2">Step 1 of 2</p>
        </div>

        <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-xl mb-6">
          <CardContent className="p-6">
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Upload Document</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">Driver's license, passport, or national ID</p>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Camera className="w-4 h-4 mr-2" />
                Take Photo
              </Button>
            </div>
          </CardContent>
        </Card>

        <Button
          onClick={() => {
            setKycProgress(75)
            setCurrentScreen("kyc-selfie")
          }}
          className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          Continue
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      </div>
    </motion.div>
  )

  const KYCSelfieScreen = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="min-h-screen p-6 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900"
    >
      <div className="max-w-md mx-auto pt-12">
        <Button variant="ghost" onClick={() => setCurrentScreen("kyc-upload")} className="mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Take a Selfie</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            We'll compare this with your ID to verify your identity
          </p>
          <Progress value={kycProgress} className="h-2" />
          <p className="text-sm text-gray-500 mt-2">Step 2 of 2</p>
        </div>

        <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-xl mb-6">
          <CardContent className="p-6">
            <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-4">
              <div className="w-32 h-32 border-4 border-blue-500 rounded-full flex items-center justify-center">
                <User className="w-16 h-16 text-gray-400" />
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Position your face in the circle
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Make sure your face is clearly visible and well-lit
              </p>
            </div>
          </CardContent>
        </Card>

        <Button
          onClick={() => {
            setKycProgress(100)
            setTimeout(() => setCurrentScreen("dashboard"), 1000)
          }}
          className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Camera className="w-4 h-4 mr-2" />
          Take Selfie
        </Button>
      </div>
    </motion.div>
  )

  const DashboardScreen = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/50"
    >
      {/* Premium Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-indigo-600/5 dark:from-blue-400/5 dark:via-purple-400/5 dark:to-indigo-400/5" />
        <div className="relative p-6 pb-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-slate-100 dark:to-white bg-clip-text text-transparent"
              >
                Good morning, Leslye
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-slate-600 dark:text-slate-300 font-medium"
              >
                Ready to send money worldwide?
              </motion.p>
            </div>
            <div className="flex items-center space-x-3">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="w-11 h-11 rounded-2xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {theme === "dark" ? (
                    <Sun className="w-5 h-5 text-amber-500" />
                  ) : (
                    <Moon className="w-5 h-5 text-slate-600" />
                  )}
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-11 h-11 rounded-2xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Bell className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                </Button>
              </motion.div>
            </div>
          </div>

          {/* Premium Balance Card */}
          <motion.div variants={cardVariants} className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl blur-xl opacity-20" />
            <Card className="relative backdrop-blur-2xl bg-gradient-to-r from-blue-600/95 via-purple-600/95 to-indigo-600/95 border-0 shadow-2xl text-white rounded-3xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10" />
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-white/10 to-transparent rounded-full -translate-y-32 translate-x-32" />
              <CardContent className="relative p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                      <Wallet className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-white/80 text-sm font-medium">Available Balance</p>
                      <p className="text-white/60 text-xs">NGN Wallet</p>
                    </div>
                  </div>
                  <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">Primary</Badge>
                </div>
                <div className="mb-4">
                  <motion.p
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="text-5xl font-bold text-white mb-2"
                  >
                    ₦6,543,210
                  </motion.p>
                  <p className="text-white/70 text-sm">Last updated: Just now</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-white/80 text-sm">Live balance</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-white/80" />
                    <span className="text-white/80 text-sm">FDIC Insured</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Premium Quick Actions */}
          <motion.div variants={cardVariants} className="mb-8">
            <Card className="backdrop-blur-2xl bg-white/70 dark:bg-slate-800/70 border border-white/20 dark:border-slate-700/50 shadow-2xl rounded-3xl">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-4">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={() => setCurrentScreen("send-country")}
                      className="w-full h-20 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 flex-col space-y-2 text-white border-0"
                    >
                      <Send className="w-7 h-7" />
                      <span className="font-semibold">Send Money</span>
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant="outline"
                      className="w-full h-20 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl hover:bg-white/70 dark:hover:bg-slate-800/70 shadow-lg hover:shadow-xl transition-all duration-300 flex-col space-y-2"
                    >
                      <Plus className="w-7 h-7 text-slate-700 dark:text-slate-300" />
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Add Money</span>
                    </Button>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Premium Rate Alert */}
          <motion.div variants={cardVariants} className="mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-500 rounded-3xl blur-xl opacity-20" />
              <Card className="relative backdrop-blur-2xl bg-gradient-to-r from-emerald-50/90 to-green-50/90 dark:from-emerald-950/90 dark:to-green-950/90 border border-emerald-200/50 dark:border-emerald-800/50 shadow-2xl rounded-3xl">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                      <TrendingUp className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-emerald-800 dark:text-emerald-200 text-lg">Great Rate Alert!</h3>
                      <p className="text-emerald-600 dark:text-emerald-300 font-medium">
                        NGN to USD rate improved by 2.5% - Send now to save more
                      </p>
                    </div>
                    <ChevronRight className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Compact Live Exchange Rates */}
          <motion.div variants={cardVariants} className="mb-8">
            <Card className="backdrop-blur-2xl bg-white/70 dark:bg-slate-800/70 border border-white/20 dark:border-slate-700/50 shadow-2xl rounded-3xl">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
                    Live Exchange Rates
                  </CardTitle>
                  <Button variant="ghost" className="text-blue-600 dark:text-blue-400 p-0 h-auto">
                    See all
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { from: "NGN", to: "USD", rate: "0.00065", change: "+2.5%", trend: "up", flag: "🇺🇸" },
                    { from: "NGN", to: "GBP", rate: "0.00051", change: "+1.8%", trend: "up", flag: "🇬🇧" },
                  ].map((rate, index) => (
                    <motion.div
                      key={`${rate.from}-${rate.to}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-slate-50/80 to-white/80 dark:from-slate-800/80 dark:to-slate-700/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-600/50 shadow-md"
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 rounded-lg flex items-center justify-center mr-2 shadow-sm">
                          <span className="text-sm">{rate.flag}</span>
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white text-sm">
                            1 {rate.from} = {rate.rate} {rate.to}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div
                          className={`w-2 h-2 rounded-full ${rate.trend === "up" ? "bg-green-500" : "bg-red-500"} animate-pulse mr-1`}
                        />
                        <span
                          className={`text-xs ${rate.trend === "up" ? "text-green-600" : "text-red-600"} font-medium`}
                        >
                          {rate.change}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Premium Recent Transfers */}
          <motion.div variants={cardVariants}>
            <Card className="backdrop-blur-2xl bg-white/70 dark:bg-slate-800/70 border border-white/20 dark:border-slate-700/50 shadow-2xl rounded-3xl">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">Recent Transfers</CardTitle>
                  <Button
                    variant="ghost"
                    onClick={() => setCurrentScreen("history")}
                    className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-xl font-semibold"
                  >
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="space-y-4">
                  {transactions.slice(0, 3).map((tx, index) => (
                    <motion.div
                      key={tx.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      whileHover={{ scale: 1.01 }}
                      className="flex items-center justify-between p-5 rounded-2xl bg-gradient-to-r from-slate-50/80 to-white/80 dark:from-slate-800/80 dark:to-slate-700/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-600/50 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <div className="flex items-center">
                        <div className="w-14 h-14 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 rounded-2xl flex items-center justify-center mr-4 shadow-md">
                          <span className="text-2xl">{tx.country}</span>
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white text-lg">{tx.recipient}</p>
                          <p className="text-slate-600 dark:text-slate-300 font-medium">{tx.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900 dark:text-white text-lg">
                          ₦{tx.amount.toLocaleString()}
                        </p>
                        <Badge
                          variant={tx.status === "completed" ? "default" : "secondary"}
                          className={`${
                            tx.status === "completed"
                              ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-md"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200"
                          } font-semibold`}
                        >
                          {tx.status}
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Premium Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border-t border-white/20 dark:border-slate-700/50 p-4 shadow-2xl">
        <div className="flex justify-around max-w-md mx-auto">
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button
              variant="ghost"
              className="flex-col h-auto py-3 px-4 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 rounded-2xl"
            >
              <Home className="w-6 h-6 mb-1" />
              <span className="text-xs font-semibold">Home</span>
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button
              variant="ghost"
              className="flex-col h-auto py-3 px-4 rounded-2xl"
              onClick={() => setCurrentScreen("send-country")}
            >
              <Send className="w-6 h-6 mb-1" />
              <span className="text-xs font-semibold">Send</span>
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button
              variant="ghost"
              className="flex-col h-auto py-3 px-4 rounded-2xl"
              onClick={() => setCurrentScreen("history")}
            >
              <History className="w-6 h-6 mb-1" />
              <span className="text-xs font-semibold">History</span>
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button
              variant="ghost"
              className="flex-col h-auto py-3 px-4 rounded-2xl"
              onClick={() => setCurrentScreen("profile")}
            >
              <User className="w-6 h-6 mb-1" />
              <span className="text-xs font-semibold">Profile</span>
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )

  const SendCountryScreen = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="min-h-screen p-6 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/50"
    >
      <div className="max-w-md mx-auto pt-12">
        <Button variant="ghost" onClick={() => setCurrentScreen("dashboard")} className="mb-8 rounded-2xl">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-slate-100 dark:to-white bg-clip-text text-transparent mb-2">
            Send Money To
          </h1>
          <p className="text-slate-600 dark:text-slate-300 font-medium">Choose destination country</p>
        </div>

        <div className="space-y-3">
          {countries.map((country) => (
            <motion.div key={country.code} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Card
                className="backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 border-0 shadow-xl cursor-pointer hover:shadow-2xl transition-all"
                onClick={() => {
                  setSendData({
                    ...sendData,
                    country: country.code,
                    countryName: country.name,
                    countryCurrency: country.currency,
                    countryFlag: country.flag,
                  })
                  setCurrentScreen("send-amount")
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{country.flag}</span>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{country.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{country.currency}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )

  const SendAmountScreen = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="min-h-screen p-6 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/50"
    >
      <div className="max-w-md mx-auto pt-12">
        <Button variant="ghost" onClick={() => setCurrentScreen("send-country")} className="mb-8 rounded-2xl">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-slate-100 dark:to-white bg-clip-text text-transparent mb-2">
            How much?
          </h1>
          <p className="text-slate-600 dark:text-slate-300 font-medium">Enter the amount you want to send</p>
        </div>

        <motion.div variants={cardVariants}>
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl blur-xl opacity-20" />
            <Card className="relative backdrop-blur-2xl bg-white/80 dark:bg-slate-800/80 border border-white/20 dark:border-slate-700/50 shadow-2xl rounded-3xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 rounded-xl flex items-center justify-center shadow-sm">
                      <span className="text-lg">🇳🇬</span>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white">NGN</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ArrowRight className="w-5 h-5 text-slate-400" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 rounded-xl flex items-center justify-center shadow-sm">
                      <span className="text-lg">{sendData.countryFlag || "🌎"}</span>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {sendData.countryCurrency || "---"}
                    </span>
                  </div>
                </div>

                <div className="text-center mb-6">
                  <div className="text-6xl font-light text-slate-900 dark:text-white mb-2 tabular-nums">
                    ₦{inputAmount || "0"}
                  </div>
                  {convertedAmount && (
                    <div className="text-slate-600 dark:text-slate-300 font-medium">
                      ≈ {sendData.countryCurrency} {convertedAmount}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, ".", 0, "⌫"].map((key) => (
                    <motion.div key={key} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="outline"
                        className="w-full h-14 text-lg font-semibold rounded-xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-md hover:shadow-lg transition-all duration-300"
                        onClick={() => handleKeypadPress(key)}
                      >
                        {key}
                      </Button>
                    </motion.div>
                  ))}
                </div>

                <div className="flex space-x-2 mb-6">
                  {[10000, 50000, 100000, 500000].map((amount) => (
                    <motion.div key={amount} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 rounded-xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-md hover:shadow-lg transition-all duration-300"
                        onClick={() => handleQuickAmount(amount)}
                      >
                        ₦{amount.toLocaleString()}
                      </Button>
                    </motion.div>
                  ))}
                </div>

                {/* Fee display */}
                {Number.parseFloat(inputAmount) > 0 && (
                  <div className="bg-blue-50/80 dark:bg-blue-950/50 rounded-xl p-4 border border-blue-100 dark:border-blue-900/50">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-2" />
                        <span className="text-blue-700 dark:text-blue-300 font-medium">Transfer fee (1.5%)</span>
                      </div>
                      <span className="font-bold text-blue-700 dark:text-blue-300">
                        ₦{(Number.parseFloat(inputAmount) * 0.015).toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={() => {
              if (Number.parseFloat(inputAmount) > 0) {
                setRateCountdown(30)
                setCurrentScreen("send-rate")
              }
            }}
            disabled={!Number.parseFloat(inputAmount)}
            className="w-full h-14 text-lg font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50"
          >
            Continue
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </motion.div>
      </div>
    </motion.div>
  )

  const SendRateScreen = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="min-h-screen p-6 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/50"
    >
      <div className="max-w-md mx-auto pt-12">
        <Button variant="ghost" onClick={() => setCurrentScreen("send-amount")} className="mb-8 rounded-2xl">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-slate-100 dark:to-white bg-clip-text text-transparent mb-2">
            Exchange Rate
          </h1>
          <p className="text-slate-600 dark:text-slate-300 font-medium">Guaranteed rate locked for you</p>
        </div>

        <motion.div variants={cardVariants}>
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl blur-xl opacity-20" />
            <Card className="relative backdrop-blur-2xl bg-white/80 dark:bg-slate-800/80 border border-white/20 dark:border-slate-700/50 shadow-2xl rounded-3xl">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center mb-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-slate-900 dark:text-white">
                        ₦{Number.parseFloat(inputAmount).toLocaleString()}
                      </div>
                      <div className="text-slate-600 dark:text-slate-300 font-medium">NGN</div>
                    </div>
                    <div className="mx-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <ArrowRight className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-slate-900 dark:text-white">
                        {sendData.countryCurrency} {convertedAmount}
                      </div>
                      <div className="text-slate-600 dark:text-slate-300 font-medium">{sendData.countryCurrency}</div>
                    </div>
                  </div>

                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur-lg opacity-20" />
                    <div className="relative bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 rounded-2xl p-6 border border-blue-200/50 dark:border-blue-800/50">
                      <div className="flex items-center justify-center mb-3">
                        <Clock className="w-5 h-5 text-blue-600 mr-2" />
                        <span className="text-blue-600 dark:text-blue-400 font-bold">
                          Rate locked for {rateCountdown}s
                        </span>
                      </div>
                      <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        1 NGN = {mockExchangeRates[sendData.countryCurrency as keyof typeof mockExchangeRates]}{" "}
                        {sendData.countryCurrency}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 text-slate-600 dark:text-slate-300">
                    <div className="flex justify-between items-center py-2">
                      <span className="font-medium">Amount to send</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        ₦{Number.parseFloat(inputAmount).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="font-medium">Transfer fee (1.5%)</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        ₦{(Number.parseFloat(inputAmount) * 0.015).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="font-medium">Exchange rate</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        1 NGN = {mockExchangeRates[sendData.countryCurrency as keyof typeof mockExchangeRates]}{" "}
                        {sendData.countryCurrency}
                      </span>
                    </div>
                    <Separator className="my-4" />
                    <div className="flex justify-between items-center py-2">
                      <span className="font-bold text-lg text-slate-900 dark:text-white">Recipient gets</span>
                      <span className="font-bold text-lg text-slate-900 dark:text-white">
                        {sendData.countryCurrency} {convertedAmount}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={() => setCurrentScreen("send-beneficiary")}
            className="w-full h-14 text-lg font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300"
          >
            Accept Rate
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </motion.div>
      </div>
    </motion.div>
  )

  const SendBeneficiaryScreen = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="min-h-screen p-6 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/50"
    >
      <div className="max-w-md mx-auto pt-12">
        <Button variant="ghost" onClick={() => setCurrentScreen("send-rate")} className="mb-8 rounded-2xl">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-slate-100 dark:to-white bg-clip-text text-transparent mb-2">
            Who's receiving?
          </h1>
          <p className="text-slate-600 dark:text-slate-300 font-medium">Add recipient details</p>
        </div>

        <motion.div variants={cardVariants}>
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl blur-xl opacity-20" />
            <Card className="relative backdrop-blur-2xl bg-white/80 dark:bg-slate-800/80 border border-white/20 dark:border-slate-700/50 shadow-2xl rounded-3xl">
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-slate-700 dark:text-slate-300">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    placeholder="Enter first name"
                    className="h-12 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-slate-700 dark:text-slate-300">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    placeholder="Enter last name"
                    className="h-12 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-slate-700 dark:text-slate-300">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    placeholder={`+${sendData.countryName ? sendData.countryName : "Country"} phone number`}
                    className="h-12 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bank" className="text-slate-700 dark:text-slate-300">
                    Bank
                  </Label>
                  <Select>
                    <SelectTrigger className="h-12 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-xl">
                      <SelectValue placeholder="Select bank" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gtb">GTBank</SelectItem>
                      <SelectItem value="access">Access Bank</SelectItem>
                      <SelectItem value="zenith">Zenith Bank</SelectItem>
                      <SelectItem value="uba">UBA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="account" className="text-slate-700 dark:text-slate-300">
                    Account Number
                  </Label>
                  <Input
                    id="account"
                    placeholder="Enter account number"
                    className="h-12 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-xl"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={() => setCurrentScreen("send-funding")}
            className="w-full h-14 text-lg font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300"
          >
            Continue
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </motion.div>
      </div>
    </motion.div>
  )

  const SendFundingScreen = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="min-h-screen p-6 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/50"
    >
      <div className="max-w-md mx-auto pt-12">
        <Button variant="ghost" onClick={() => setCurrentScreen("send-beneficiary")} className="mb-8 rounded-2xl">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-slate-100 dark:to-white bg-clip-text text-transparent mb-2">
            How to pay?
          </h1>
          <p className="text-slate-600 dark:text-slate-300 font-medium">Choose your payment method</p>
        </div>

        <div className="space-y-4 mb-6">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Card
              className="backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 border-0 shadow-xl cursor-pointer hover:shadow-2xl transition-all"
              onClick={() => {
                setSendData({ ...sendData, funding: "wallet" })
                setCurrentScreen("send-confirm")
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center mr-4">
                      <Wallet className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Bridge Wallet</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Balance: ₦6,543,210</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Instant</Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 border-0 shadow-xl opacity-60">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center mr-4">
                    <CreditCard className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Debit Card</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">•••• 4242</p>
                  </div>
                </div>
                <Badge variant="outline">+₦{(Number.parseFloat(inputAmount) * 0.029).toLocaleString()} fee</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 border-0 shadow-xl opacity-60">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center mr-4">
                    <Smartphone className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Bank Transfer</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">2-4 hours</p>
                  </div>
                </div>
                <Badge variant="outline">No fee</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={() => setCurrentScreen("send-confirm")}
            className="w-full h-14 text-lg font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300"
          >
            Continue
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </motion.div>
      </div>
    </motion.div>
  )

  const SendConfirmScreen = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="min-h-screen p-6 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/50"
    >
      <div className="max-w-md mx-auto pt-12">
        <Button variant="ghost" onClick={() => setCurrentScreen("send-funding")} className="mb-8 rounded-2xl">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-slate-100 dark:to-white bg-clip-text text-transparent mb-2">
            Confirm Transfer
          </h1>
          <p className="text-slate-600 dark:text-slate-300 font-medium">Review your transfer details</p>
        </div>

        <motion.div variants={cardVariants}>
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl blur-xl opacity-20" />
            <Card className="relative backdrop-blur-2xl bg-white/80 dark:bg-slate-800/80 border border-white/20 dark:border-slate-700/50 shadow-2xl rounded-3xl">
              <CardContent className="p-6 space-y-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                    {sendData.countryCurrency} {convertedAmount}
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">John Doe will receive</p>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-300">You send</span>
                    <span className="font-semibold">₦{Number.parseFloat(inputAmount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-300">Transfer fee</span>
                    <span className="font-semibold">₦{(Number.parseFloat(inputAmount) * 0.015).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-300">Exchange rate</span>
                    <span className="font-semibold">
                      1 NGN = {mockExchangeRates[sendData.countryCurrency as keyof typeof mockExchangeRates]}{" "}
                      {sendData.countryCurrency}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-300">Payment method</span>
                    <span className="font-semibold">Bridge Wallet</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-300">Delivery time</span>
                    <span className="font-semibold">Instant</span>
                  </div>
                </div>

                <Separator />

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <div className="flex items-center">
                    <Shield className="w-5 h-5 text-blue-600 mr-2" />
                    <div>
                      <p className="font-semibold text-blue-800 dark:text-blue-200">Secure Transfer</p>
                      <p className="text-sm text-blue-600 dark:text-blue-300">Protected by 256-bit encryption</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={() => setCurrentScreen("send-success")}
            className="w-full h-14 text-lg font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 mb-4"
          >
            <Fingerprint className="w-5 h-5 mr-2" />
            Confirm with Touch ID
          </Button>
        </motion.div>

        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
          By confirming, you agree to our Terms of Service
        </p>
      </div>
    </motion.div>
  )

  const SendSuccessScreen = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mb-8"
      >
        <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-2xl">
          <CheckCircle className="w-12 h-12 text-white" />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Transfer Sent!</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
          {sendData.countryCurrency} {convertedAmount} is on its way to John Doe
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">Transfer ID: BRG-2024-001234</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="w-full max-w-sm space-y-4"
      >
        <Button
          onClick={() => setCurrentScreen("dashboard")}
          className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          Back to Home
        </Button>

        <Button variant="outline" className="w-full h-12 text-lg font-semibold">
          Share Receipt
        </Button>
      </motion.div>
    </motion.div>
  )

  const HistoryScreen = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="min-h-screen p-6 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900"
    >
      <div className="max-w-md mx-auto pt-12">
        <Button variant="ghost" onClick={() => setCurrentScreen("dashboard")} className="mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Transfer History</h1>

          <div className="flex space-x-2 mb-4">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <Input placeholder="Search transfers..." className="pl-10" />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex space-x-2">
            <Badge variant="default">All</Badge>
            <Badge variant="outline">Completed</Badge>
            <Badge variant="outline">Pending</Badge>
          </div>
        </div>

        <div className="space-y-4">
          {transactions.map((tx) => (
            <motion.div key={tx.id} variants={cardVariants} whileHover={{ scale: 1.02 }}>
              <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mr-3">
                        <span className="text-lg">{tx.country}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{tx.recipient}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{tx.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 dark:text-white">₦{tx.amount.toLocaleString()}</p>
                      <Badge
                        variant={tx.status === "completed" ? "default" : "secondary"}
                        className={tx.status === "completed" ? "bg-green-500" : ""}
                      >
                        {tx.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
                    <span>
                      Recipient gets: {tx.toAmount.toLocaleString()} {tx.toCurrency}
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )

  const ProfileScreen = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="min-h-screen p-6 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900"
    >
      <div className="max-w-md mx-auto pt-12">
        <Button variant="ghost" onClick={() => setCurrentScreen("dashboard")} className="mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="text-center mb-8">
          <Avatar className="w-20 h-20 mx-auto mb-4">
            <AvatarImage src="/placeholder-user.jpg" />
            <AvatarFallback className="text-xl">LJ</AvatarFallback>
          </Avatar>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Leslye Johnson</h1>
          <p className="text-gray-600 dark:text-gray-300">leslye.johnson@email.com</p>
          <Badge className="mt-2 bg-green-100 text-green-800">Verified</Badge>
        </div>

        <div className="space-y-4">
          <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Fingerprint className="w-5 h-5 text-blue-600 mr-3" />
                  <span className="font-medium">Biometric Login</span>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Bell className="w-5 h-5 text-blue-600 mr-3" />
                  <span className="font-medium">Push Notifications</span>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Globe className="w-5 h-5 text-blue-600 mr-3" />
                  <span className="font-medium">Currency Preference</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-300 mr-2">NGN</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="w-5 h-5 text-blue-600 mr-3" />
                  <span className="font-medium">Documents</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CreditCard className="w-5 h-5 text-blue-600 mr-3" />
                  <span className="font-medium">Payment Methods</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Settings className="w-5 h-5 text-blue-600 mr-3" />
                  <span className="font-medium">Settings</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Button variant="outline" className="w-full mt-8 h-12 text-red-600 border-red-200 hover:bg-red-50">
          Sign Out
        </Button>
      </div>
    </motion.div>
  )

  const renderScreen = () => {
    switch (currentScreen) {
      case "welcome":
        return <WelcomeScreen />
      case "signup":
        return <SignupScreen />
      case "kyc-upload":
        return <KYCUploadScreen />
      case "kyc-selfie":
        return <KYCSelfieScreen />
      case "dashboard":
        return <DashboardScreen />
      case "send-country":
        return <SendCountryScreen />
      case "send-amount":
        return <SendAmountScreen />
      case "send-rate":
        return <SendRateScreen />
      case "send-beneficiary":
        return <SendBeneficiaryScreen />
      case "send-funding":
        return <SendFundingScreen />
      case "send-confirm":
        return <SendConfirmScreen />
      case "send-success":
        return <SendSuccessScreen />
      case "history":
        return <HistoryScreen />
      case "profile":
        return <ProfileScreen />
      default:
        return <WelcomeScreen />
    }
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <div className="min-h-screen">
        <AnimatePresence mode="wait">{renderScreen()}</AnimatePresence>
      </div>
    </ThemeProvider>
  )
}
