"use client";
import axios from 'axios';
import React from 'react';

const page = () => {
	const [loginInfo, setLoginInfo] = React.useState({
    loginId: "",
    password: "",
  });

	const [loading, setLoading] = React.useState(false);
  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

	const LoginFunction = async () => {
		setLoading(true);
		const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/user/login`, loginInfo);
		console.log(response.data);
		setLoading(false);
	}

  return (
    <div className="flex items-center justify-center bg-cover bg-center bg-no-repeat min-h-screen bg-[#222222b3]">
      {/* Left Section - Login Form */}
      <div className="w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">

          {/* Login Form */}
          <div className="bg-white rounded-lg p-8 shadow-sm border-pink-500 border-2">
            <h1 className="text-2xl font-semibold text-gray-800 mb-2">
              Log in to your account (Admin)
            </h1>
            <p className="text-gray-600 mb-6">
              Welcome back! Please enter your details.
            </p>

            <form className="space-y-4" onSubmit={LoginFunction}>
              <div>
                <label className="block text-sm text-gray-900 mb-1">
                  Login Id
                </label>
                <input
                  type="text"
                  name="loginId"
                  value={loginInfo.loginId}
                  onChange={handleOnChange}
                  placeholder="Enter your email"
                  className="w-full px-4 py-2 border text-black border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={loginInfo.password}
                  onChange={handleOnChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 border text-black border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="remember"
                    className="h-4 w-4 text-pink-500 focus:ring-pink-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="remember"
                    className="ml-2 text-sm text-gray-600"
                  >
                    Remember Me
                  </label>
                </div>
                <button
                  type="button"
                  className="text-sm text-pink-500 hover:text-pink-600"
                >
                  Forgot password
                </button>
              </div>

              {/* <button
                type="submit"
                className="w-full bg-pink-500 text-white py-2 rounded-md hover:bg-pink-600 transition-colors"
              >
                {loading? <Player
                autoplay
                loop
                src={loadingAnimation}
                style={{ height: "30px", width: "100px" }}
              /> : "Log In"}
              </button> */}
            </form>

            <p className="text-center mt-6 text-sm text-gray-600">
              Dont have an account?{" "}
              <button className="text-pink-500 hover:text-pink-600">
                Contact
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default page
