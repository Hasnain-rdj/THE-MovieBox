"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { AUTH_API_URL } from "@/config";
import {
  User as UserIcon,
  Shield,
  Key,
  Camera,
  Save,
  CheckCircle2,
  AlertCircle,
  Users,
  Lock,
  ArrowLeft,
  RefreshCw,
  X,
  Eye,
  EyeOff,
} from "lucide-react";
import { motion } from "framer-motion";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: "User" | "Admin";
  avatarUrl?: string;
  createdAt?: string;
}

function ProfileContent() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // User state
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Edit Profile States
  const [name, setName] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [profileSaving, setProfileSaving] = useState<boolean>(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Password Visibility States
  const [showCurrentPassword, setShowCurrentPassword] = useState<boolean>(false);
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState<boolean>(false);
  const [showAdminNewPassword, setShowAdminNewPassword] = useState<boolean>(false);

  // Change Password States
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>("");
  const [passwordSaving, setPasswordSaving] = useState<boolean>(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Admin User List States
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [usersLoading, setUsersLoading] = useState<boolean>(false);
  const [adminModalUser, setAdminModalUser] = useState<UserProfile | null>(null);
  const [adminNewPassword, setAdminNewPassword] = useState<string>("");
  const [adminPasswordSaving, setAdminPasswordSaving] = useState<boolean>(false);
  const [adminMsg, setAdminMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Load User on Mount
  useEffect(() => {
    const savedUser = localStorage.getItem("moviebox_user");
    const token = localStorage.getItem("moviebox_token");

    if (!savedUser || !token) {
      router.push("/");
      return;
    }

    try {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setName(parsedUser.name || "");
      setAvatarUrl(parsedUser.avatarUrl || "");
      setLoading(false);

      if (parsedUser.role === "Admin") {
        fetchUsersList(token);
      }
    } catch (e) {
      router.push("/");
    }
  }, [router]);

  // Admin: Fetch list of all users
  const fetchUsersList = async (tokenOverride?: string) => {
    const token = tokenOverride || localStorage.getItem("moviebox_token");
    if (!token) return;

    setUsersLoading(true);
    try {
      const res = await fetch(`${AUTH_API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAllUsers(data);
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setUsersLoading(false);
    }
  };

  // Upload local image from laptop & resize using Canvas to lightweight Base64
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const resizedBase64 = canvas.toDataURL("image/jpeg", 0.85);
          setAvatarUrl(resizedBase64);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Submit Profile Changes (Name & Profile Picture)
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg(null);

    const token = localStorage.getItem("moviebox_token");
    if (!token) return;

    try {
      const res = await fetch(`${AUTH_API_URL}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, avatarUrl }),
      });

      let data: any = {};
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(text || "Failed to update profile");
      }

      if (!res.ok) {
        throw new Error(data.message || "Failed to update profile");
      }

      setUser(data.user);
      localStorage.setItem("moviebox_user", JSON.stringify(data.user));
      setProfileMsg({ type: "success", text: "Profile updated successfully!" });
    } catch (err: any) {
      setProfileMsg({ type: "error", text: err.message || "Failed to update profile." });
    } finally {
      setProfileSaving(false);
    }
  };

  // Submit Password Change for current user
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSaving(true);
    setPasswordMsg(null);

    if (newPassword !== confirmNewPassword) {
      setPasswordMsg({ type: "error", text: "New password and Confirm Password do not match." });
      setPasswordSaving(false);
      return;
    }

    if (newPassword.length < 4) {
      setPasswordMsg({ type: "error", text: "New password must be at least 4 characters long." });
      setPasswordSaving(false);
      return;
    }

    const token = localStorage.getItem("moviebox_token");
    if (!token) return;

    try {
      const res = await fetch(`${AUTH_API_URL}/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Password change failed");
      }

      setPasswordMsg({ type: "success", text: "Password changed successfully!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err: any) {
      setPasswordMsg({ type: "error", text: err.message || "Failed to change password." });
    } finally {
      setPasswordSaving(false);
    }
  };

  // Admin: Submit Password Change for ANY user
  const handleAdminChangeUserPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminModalUser) return;

    setAdminPasswordSaving(true);
    setAdminMsg(null);

    const token = localStorage.getItem("moviebox_token");
    if (!token) return;

    try {
      const res = await fetch(`${AUTH_API_URL}/users/${adminModalUser.id || (adminModalUser as any)._id}/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newPassword: adminNewPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Admin password update failed");
      }

      setAdminMsg({ type: "success", text: data.message || "User password updated successfully!" });
      setTimeout(() => {
        setAdminModalUser(null);
        setAdminNewPassword("");
        setAdminMsg(null);
      }, 1200);
    } catch (err: any) {
      setAdminMsg({ type: "error", text: err.message || "Failed to update user password." });
    } finally {
      setAdminPasswordSaving(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("moviebox_token");
    localStorage.removeItem("moviebox_user");
    router.push("/");
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#0d0f12] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-yellow-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-zinc-400">Loading user profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0f12] text-white font-sans pb-12">
      <Navbar user={user} onLogout={handleLogout} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Navigation & Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2.5 rounded-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white transition-all cursor-pointer"
              title="Go back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black text-white">
                  User Account & Security Settings
                </h1>
                <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                  user.role === "Admin"
                    ? "bg-yellow-400/10 text-yellow-400 border-yellow-400/30"
                    : "bg-zinc-800 text-zinc-300 border-zinc-700"
                }`}>
                  {user.role} Account
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                Manage profile details, update profile picture, and configure security passwords.
              </p>
            </div>
          </div>
        </div>

        {/* Profile Details & Password Form Cards (Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Edit Name & Local File Profile Picture (7 Cols) */}
          <div className="lg:col-span-6 bg-zinc-900/80 border border-zinc-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-6">
                <UserIcon className="w-5 h-5 text-yellow-400" />
                <h2 className="text-lg font-bold text-white tracking-wide">
                  Edit Personal Information
                </h2>
              </div>

              {profileMsg && (
                <div className={`mb-5 p-3 rounded-xl border flex items-center gap-2.5 text-xs ${
                  profileMsg.type === "success"
                    ? "bg-green-500/10 border-green-500/30 text-green-400"
                    : "bg-red-500/10 border-red-500/30 text-red-400"
                }`}>
                  {profileMsg.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                  <span>{profileMsg.text}</span>
                </div>
              )}

              {/* Profile Avatar Upload Section */}
              <div className="flex flex-col items-center sm:flex-row sm:items-center gap-5 mb-6 p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/60">
                <div className="relative group">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center font-black text-2xl text-black shadow-xl overflow-hidden border-2 border-yellow-400/60">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      user.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white"
                    title="Upload new profile picture"
                  >
                    <Camera className="w-6 h-6 text-yellow-400" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="hidden"
                  />
                </div>

                <div className="flex flex-col gap-1.5 text-center sm:text-left">
                  <span className="text-xs font-bold text-white">Profile Photo</span>
                  <span className="text-[11px] text-zinc-400">
                    Upload an image from your laptop storage (Auto-optimized).
                  </span>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-yellow-400 hover:text-yellow-300 mt-1 cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Choose File from Storage</span>
                  </button>
                </div>
              </div>

              {/* Edit Form */}
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                    Full Display Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-yellow-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                    Email Address (Read-only)
                  </label>
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className="w-full bg-zinc-950/40 border border-zinc-800/60 rounded-xl px-4 py-2.5 text-xs text-zinc-500 cursor-not-allowed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={profileSaving}
                  className="w-full py-2.5 rounded-xl bg-yellow-400 text-black text-xs font-extrabold hover:bg-yellow-300 transition-all shadow-lg shadow-yellow-500/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{profileSaving ? "Saving Changes..." : "Save Profile Details"}</span>
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Change Password Form (6 Cols) */}
          <div className="lg:col-span-6 bg-zinc-900/80 border border-zinc-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-6">
                <Key className="w-5 h-5 text-yellow-400" />
                <h2 className="text-lg font-bold text-white tracking-wide">
                  Change Password
                </h2>
              </div>

              {passwordMsg && (
                <div className={`mb-5 p-3 rounded-xl border flex items-center gap-2.5 text-xs ${
                  passwordMsg.type === "success"
                    ? "bg-green-500/10 border-green-500/30 text-green-400"
                    : "bg-red-500/10 border-red-500/30 text-red-400"
                }`}>
                  {passwordMsg.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                  <span>{passwordMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                    Current Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 pl-10 pr-10 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-yellow-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3.5 top-3 text-zinc-500 hover:text-white transition-colors cursor-pointer"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                    <input
                      type={showNewPassword ? "text" : "password"}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password (min 4 chars)"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 pl-10 pr-10 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-yellow-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3.5 top-3 text-zinc-500 hover:text-white transition-colors cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                    <input
                      type={showConfirmNewPassword ? "text" : "password"}
                      required
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 pl-10 pr-10 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-yellow-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                      className="absolute right-3.5 top-3 text-zinc-500 hover:text-white transition-colors cursor-pointer"
                    >
                      {showConfirmNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={passwordSaving}
                  className="w-full py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs font-extrabold hover:bg-zinc-700 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
                >
                  <Key className="w-4 h-4 text-yellow-400" />
                  <span>{passwordSaving ? "Updating Password..." : "Update Password"}</span>
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Admin Section: System User Directory & Password Overrides */}
        {user.role === "Admin" && (
          <section className="bg-zinc-900/80 border border-zinc-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 mt-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
              <div className="flex items-center gap-2.5">
                <Shield className="w-5 h-5 text-yellow-400" />
                <div>
                  <h2 className="text-lg font-bold text-white tracking-wide">
                    Admin User Management Directory
                  </h2>
                  <p className="text-xs text-zinc-400">
                    As an Admin, you can review registered user accounts and update passwords for any user.
                  </p>
                </div>
              </div>

              <button
                onClick={() => fetchUsersList()}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-300 hover:text-white bg-zinc-800 border border-zinc-700 px-3.5 py-1.5 rounded-full cursor-pointer transition-all self-start sm:self-auto"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${usersLoading ? "animate-spin" : ""}`} />
                <span>Refresh Directory</span>
              </button>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-950/60">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-zinc-900 text-zinc-400 uppercase tracking-wider font-semibold border-b border-zinc-800">
                  <tr>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {allUsers.map((u) => {
                    const userId = u.id || (u as any)._id;
                    return (
                      <tr key={userId} className="hover:bg-zinc-900/50 transition-colors">
                        <td className="py-3 px-4 font-semibold text-white flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-xs text-yellow-400 overflow-hidden shrink-0">
                            {u.avatarUrl ? (
                              <img src={u.avatarUrl} alt={u.name} className="w-full h-full object-cover" />
                            ) : (
                              u.name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <span>{u.name}</span>
                        </td>
                        <td className="py-3 px-4 text-zinc-400">{u.email}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            u.role === "Admin"
                              ? "bg-yellow-400/10 text-yellow-400 border-yellow-400/30"
                              : "bg-zinc-800 text-zinc-400 border-zinc-700"
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => {
                              setAdminModalUser(u);
                              setAdminNewPassword("");
                              setAdminMsg(null);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-400/10 hover:bg-yellow-400/20 text-yellow-400 border border-yellow-400/30 text-xs font-bold transition-all cursor-pointer"
                          >
                            <Key className="w-3.5 h-3.5" />
                            <span>Change Password</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Admin User Password Reset Modal */}
        {adminModalUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
            <div className="relative w-full max-w-md bg-[#14171c] border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
              <button
                onClick={() => setAdminModalUser(null)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-full hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2.5 mb-2">
                <Shield className="w-5 h-5 text-yellow-400" />
                <h3 className="text-lg font-bold text-white">Admin Override Password</h3>
              </div>
              <p className="text-xs text-zinc-400 mb-5">
                Set a new password for <span className="text-white font-bold">{adminModalUser.name}</span> ({adminModalUser.email}).
              </p>

              {adminMsg && (
                <div className={`mb-4 p-3 rounded-xl border flex items-center gap-2.5 text-xs ${
                  adminMsg.type === "success"
                    ? "bg-green-500/10 border-green-500/30 text-green-400"
                    : "bg-red-500/10 border-red-500/30 text-red-400"
                }`}>
                  {adminMsg.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                  <span>{adminMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleAdminChangeUserPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                    New User Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                    <input
                      type={showAdminNewPassword ? "text" : "password"}
                      required
                      value={adminNewPassword}
                      onChange={(e) => setAdminNewPassword(e.target.value)}
                      placeholder="Enter new password for user"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 pl-10 pr-10 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-yellow-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminNewPassword(!showAdminNewPassword)}
                      className="absolute right-3.5 top-3 text-zinc-500 hover:text-white transition-colors cursor-pointer"
                    >
                      {showAdminNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setAdminModalUser(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={adminPasswordSaving}
                    className="px-5 py-2 rounded-xl bg-yellow-400 text-black text-xs font-extrabold hover:bg-yellow-300 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {adminPasswordSaving ? "Updating..." : "Save Password"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0d0f12] text-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ProfileContent />
    </Suspense>
  );
}
