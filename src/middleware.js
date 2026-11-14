import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request) {
  const token = request.cookies.get("resumeai_session")?.value;
  if (!token || !process.env.JWT_SECRET) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });
    const pathname = request.nextUrl.pathname;

    if (
      pathname.startsWith("/dashboard/student") &&
      payload.role !== "student"
    ) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
    if (
      (pathname === "/dashboard/recruiter" ||
        pathname.startsWith("/dashboard/recruiter/")) &&
      payload.role !== "recruiter"
    ) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
    return NextResponse.next();
  } catch {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("resumeai_session");
    return response;
  }
}

export const config = {
  matcher: ["/dashboard/student/:path*", "/dashboard/recruiter/:path*"],
};
