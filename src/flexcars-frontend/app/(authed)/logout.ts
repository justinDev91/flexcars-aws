import Router from "next/router";

export const logout = () => {
    window.localStorage.removeItem("token");
    window.localStorage.removeItem("user");  
    Router.push("/auth/login");
  };
  