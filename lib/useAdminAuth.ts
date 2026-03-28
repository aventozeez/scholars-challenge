"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function useAdminAuth() {
  const router = useRouter();

  useEffect(() => {
    const isAuth = localStorage.getItem("sc_admin_auth");
    if (!isAuth) {
      router.replace("/admin/login");
    }
  }, [router]);
}

export function adminLogout(router: ReturnType<typeof useRouter>) {
  localStorage.removeItem("sc_admin_auth");
  router.replace("/admin/login");
}
