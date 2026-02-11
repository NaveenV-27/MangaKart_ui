"use client";
import NavBar from "./components/Navbar";
import Footer from "./components/Footer";
import { usePathname } from 'next/navigation';
import { useEffect, useState, useRef } from "react";
import "./globals.css";
import { Provider, useDispatch } from "react-redux";
import { store } from "./redux/store/store";
import { fetchCart } from "./redux/slices/cartSlice";

// Inner component to use hooks inside Provider
function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isAuthPage, setIsAuthPage] = useState(false);
  const dispatch = useDispatch();
  const cartFetched = useRef(false);

  useEffect(() => {
    setIsAuthPage(pathname === "/login" || pathname === "/signup" || pathname === "/admin/login" || pathname === "/admin/signup");
  }, [pathname]);

  // Fetch cart on mount to ensure cart state is available across the app
  useEffect(() => {
    if (!cartFetched.current && !isAuthPage) {
      cartFetched.current = true;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (dispatch as any)(fetchCart());
    }
  }, [dispatch, isAuthPage]);

  return (
    <div>
      {!isAuthPage && <NavBar />}
      <div className={`min-h-[80vh] ${""}`}>
        {children}
      </div>
      {!isAuthPage && <Footer />}
    </div>
  );
}

export default function ConditionalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Provider store={store}>
      <LayoutContent>{children}</LayoutContent>
    </Provider>
  );
}