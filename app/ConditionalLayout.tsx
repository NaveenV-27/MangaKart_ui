"use client";
import NavBar from "./components/Navbar";
import Footer from "./components/Footer";
import { usePathname } from 'next/navigation';
import { useEffect, useState } from "react";
import "./globals.css";

export default function ConditionalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const pathname = usePathname();
  const [isAuthPage,setIsAuthPage] = useState(false);

  useEffect(() => {
    setIsAuthPage(pathname === "/login" || pathname === "/signup");
  }, [pathname])

  // console.log(pathname, isAuthPage);
  // const isRecAuthPage = pathname === "/ReceptionistAuth/login";
  return (
      <div>
        {!isAuthPage && <NavBar/>}
        <div className={`min-h-[80vh] ${isAuthPage ? "" : "bgimg"}`}>
          {children}
        </div>
        {!isAuthPage && <Footer/>}
        
      </div>
  );
}