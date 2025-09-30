"use client";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function Header() {
  const { data: session } = useSession();
  const sessionUser = session?.user;
  const router = useRouter();
  const [fullUser, setFullUser] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Fetch complete user data from database
  useEffect(() => {
    const fetchUserData = async () => {
      if (sessionUser?.email) {
        try {
          const response = await axios.get(`/api/user/profile?email=${encodeURIComponent(sessionUser.email)}`);
          setFullUser(response.data.user);
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };

    if (sessionUser) {
      fetchUserData();
    }
  }, [sessionUser]);

  useEffect(() => {
    // Check admin status via API call for security
    const checkAdminStatus = async () => {
      if (sessionUser?.email) {
        try {
          const response = await axios.post('/api/admin/check', {
            email: sessionUser.email
          });
          setIsAdmin(response.data.isAdmin || false);
        } catch (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    };

    if (sessionUser) {
      checkAdminStatus();
    }
  }, [sessionUser]);

  useEffect(() => {
    // Check if user needs to select gender - redirect to gender selection page
    if (fullUser && (!fullUser.gender || fullUser.gender === null || fullUser.gender === undefined)) {
      router.push('/gender-selection');
    }
  }, [fullUser, router]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <>
      <header className={`fixed top-0 w-full z-50 border-b border-gray-800/50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-black/60 backdrop-blur-md' 
          : 'bg-black/80 backdrop-blur-md'
      }`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo - Pink's Ticket */}
          <Link href="/" className="group flex items-center space-x-3">
            <div className="relative transition-transform group-hover:scale-105">
              <Image
                src="/pinks-ticket-exact.svg"
                alt="Pink's Ticket"
                width={80}
                height={60}
                className="h-12 w-auto"
                priority
                unoptimized
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-2xl font-black tracking-tight text-pink-500 group-hover:text-pink-400 transition-colors">
                Pink's Ticket
              </h1>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-300 hover:text-yellow-400 transition-colors font-medium">
              Now Showing
            </Link>
            <Link href="/upcoming" className="text-gray-300 hover:text-yellow-400 transition-colors font-medium">
              Coming Soon
            </Link>
            <Link href="#contact" className="text-gray-300 hover:text-yellow-400 transition-colors font-medium">
              Contact
            </Link>
          </nav>

          {/* User section */}
          <div className="flex items-center space-x-4">
            {sessionUser ? (
              <div className="flex items-center space-x-4">
                {/* Admin access for authorized users only */}
                {isAdmin && (
                  <Link 
                    href="/admin" 
                    className="hidden lg:flex items-center space-x-2 rounded-lg bg-red-600/20 border border-red-600/50 px-3 py-2 text-red-400 hover:bg-red-600/30 hover:text-red-300 transition-all duration-200"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-sm font-medium">Admin</span>
                  </Link>
                )}
                
                {/* User profile */}
                <div className="flex items-center">
                  <div className="hidden lg:block">
                    <p className="text-sm font-medium text-white">
                      {sessionUser.name?.split(" ")[0] || sessionUser.email}
                    </p>
                    <p className="text-xs text-gray-400">Movie Enthusiast</p>
                  </div>
                </div>
                
                <button
                  onClick={() => signOut()}
                  className="rounded-lg bg-gray-800/50 border border-gray-700 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700/50 hover:text-white transition-all duration-200"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => signIn("google")}
                className="group relative overflow-hidden rounded-lg bg-gradient-to-r from-red-600 to-yellow-600 px-6 py-3 font-bold text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:shadow-red-500/25"
              >
                <span className="relative z-10 flex items-center space-x-2">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Login/Signup</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 to-red-600 opacity-0 transition-opacity group-hover:opacity-100"></div>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
    </>
  );
}
