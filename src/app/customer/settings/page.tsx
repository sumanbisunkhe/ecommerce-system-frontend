/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import AdminHeader from '@/components/dashboard/admin/header';
import { Funnel_Sans } from 'next/font/google';
import { notify } from '@/components/ui/Notification';
import NotificationProvider from '@/components/ui/Notification';
import toast from 'react-hot-toast';
import { useSearchParams } from 'next/navigation';
import { BASE_URL } from '@/config/api';
import Image from 'next/image';


const funnelSans = Funnel_Sans({ subsets: ['latin'], weight: '400' });

// ---------------------- UI Components ---------------------- //
const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${className}`}>
    {children}
  </div>
);

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={`border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${props.className}`}
  />
);

const Button = ({ variant = 'primary', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' }) => {
  const baseClasses = 'px-5 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50';

  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
  };

  return (
    <button
      {...props}
      className={`${baseClasses} ${variants[variant]} ${props.className}`}
    />
  );
};

const Label = ({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) => (
  <label htmlFor={htmlFor} className="block font-medium mb-2 text-gray-700">
    {children}
  </label>
);

// ---------------------- Improved Image Cropper Component ---------------------- //
const ImageCropper = ({
  image,
  onCrop,
  onCancel
}: {
  image: string;
  onCrop: (croppedImage: string) => void;
  onCancel: () => void;
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });

  // Initialize image dimensions when loaded
  useEffect(() => {
    if (!imageRef.current) return;

    const img = document.createElement('img');
    img.onload = () => {
      setImageDimensions({
        width: img.width,
        height: img.height
      });
    };
    img.src = image;
  }, [image]);

  // Draw cropped image on canvas
  const drawCroppedImage = useCallback(() => {
    if (!canvasRef.current || !imageRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Set canvas size for the final cropped image (square)
    const size = 300;
    canvasRef.current.width = size;
    canvasRef.current.height = size;

    // Create circular clipping path
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    // Calculate scale to fit image within the crop area
    const scale = Math.max(
      size / imageDimensions.width,
      size / imageDimensions.height
    ) * zoom;

    // Calculate centered position
    const translateX = (size / 2) + crop.x;
    const translateY = (size / 2) + crop.y;

    // Apply transformations
    ctx.save();
    ctx.translate(translateX, translateY);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale, scale);
    ctx.translate(-imageDimensions.width / 2, -imageDimensions.height / 2);

    // Draw the image
    ctx.drawImage(imageRef.current, 0, 0);
    ctx.restore();
  }, [crop, zoom, rotation, imageDimensions]);

  const handleCrop = () => {
    if (!canvasRef.current || !imageRef.current) return;

    // Create a temporary canvas for the final cropped image
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    const size = 300;
    tempCanvas.width = size;
    tempCanvas.height = size;

    // Calculate scale to fit image within the crop area
    const scale = Math.max(
      size / imageDimensions.width,
      size / imageDimensions.height
    ) * zoom;

    // Calculate centered position
    const translateX = (size / 2) + crop.x;
    const translateY = (size / 2) + crop.y;

    // Apply transformations and draw the image without circular clipping
    tempCtx.save();
    tempCtx.translate(translateX, translateY);
    tempCtx.rotate((rotation * Math.PI) / 180);
    tempCtx.scale(scale, scale);
    tempCtx.translate(-imageDimensions.width / 2, -imageDimensions.height / 2);

    // Draw the image
    tempCtx.drawImage(imageRef.current, 0, 0);
    tempCtx.restore();

    // Convert to base64 and call onCrop
    const croppedImage = tempCanvas.toDataURL('image/jpeg', 0.9);
    onCrop(croppedImage);
  };

  useEffect(() => {
    drawCroppedImage();
  }, [drawCroppedImage]);

  // Handle drag to move image
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent default browser drag behavior
    setIsDragging(true);
    setStartPos({ x: e.clientX - crop.x, y: e.clientY - crop.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent default browser drag behavior
    if (!isDragging) return;

    const deltaX = e.clientX - startPos.x;
    const deltaY = e.clientY - startPos.y;

    // Add boundaries to prevent dragging too far
    const containerWidth = containerRef.current?.clientWidth || 0;
    const containerHeight = containerRef.current?.clientHeight || 0;
    const imgWidth = imageDimensions.width * zoom;
    const imgHeight = imageDimensions.height * zoom;

    // Calculate bounds
    const minX = -(imgWidth - containerWidth) / 2;
    const maxX = (imgWidth - containerWidth) / 2;
    const minY = -(imgHeight - containerHeight) / 2;
    const maxY = (imgHeight - containerHeight) / 2;

    // Clamp the values within bounds
    const newX = Math.min(Math.max(deltaX, minX), maxX);
    const newY = Math.min(Math.max(deltaY, minY), maxY);

    setCrop({
      x: newX,
      y: newY
    });
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent default browser drag behavior
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomStep = 0.1; // 10% increment/decrement
    const direction = e.deltaY > 0 ? -1 : 1; // -1 for zoom out, 1 for zoom in
    const newZoom = Math.max(0.1, Math.min(3, zoom + (direction * zoomStep)));
    setZoom(newZoom);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Crop Profile Picture</h3>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onCancel}>Cancel</Button>
            <Button onClick={handleCrop}>Save Crop</Button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <div className="mb-4 text-sm text-gray-500">
              Drag the image to position it. Use the controls below to adjust.
            </div>

            <div
              ref={containerRef}
              className="border border-gray-200 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center mb-4 select-none"
              style={{ width: '400px', height: '400px', margin: '0 auto' }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
            >
              <div
                className="relative overflow-hidden w-full h-full"
                style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
              >
                <Image
                  ref={imageRef}
                  src={image}
                  alt="Crop preview"
                  fill
                  className="absolute top-0 left-0 pointer-events-none object-contain"
                  style={{
                    transform: `translate(${crop.x}px, ${crop.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                    transformOrigin: 'center center',
                  }}
                  draggable={false}
                  sizes="400px"
                />
                <div className="absolute inset-0 border-2 border-white border-dashed rounded-full pointer-events-none"></div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div>
                <Label htmlFor="zoom">Zoom: {Math.round(zoom * 100)}%</Label>
                <input
                  id="zoom"
                  type="range"
                  min="0.1"
                  max="3"
                  step="0.1"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <Label htmlFor="rotation">Rotation: {rotation}°</Label>
                <input
                  id="rotation"
                  type="range"
                  min="-180"
                  max="180"
                  step="1"
                  value={rotation}
                  onChange={(e) => setRotation(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="flex flex-col justify-end">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setZoom(1);
                    setRotation(0);
                    setCrop({ x: 0, y: 0 });
                  }}
                >
                  Reset
                </Button>
              </div>
            </div>
          </div>

          <div className="lg:w-72">
            <div className="text-sm font-medium mb-2">Preview</div>
            <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-white shadow-lg mx-auto mb-4">
              <canvas ref={canvasRef} className="w-full h-full" />
            </div>

            <div className="text-center text-sm text-gray-500">
              This is how your profile picture will appear to others.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------------------- Settings Page ---------------------- //
export default function SettingsPage() {
  const searchParams = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [profilePictureLoading, setProfilePictureLoading] = useState(false);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>(
    searchParams.get('tab') === 'security' ? 'security' : 'profile'
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  useEffect(() => {
    // Get user from cookie
    const cookies = document.cookie.split(';');
    const userCookie = cookies.find(cookie => cookie.trim().startsWith('user='));
    if (userCookie) {
      const userData = JSON.parse(decodeURIComponent(userCookie.split('=')[1]));
      setUser(userData);
    }
  }, []);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'security' || tab === 'profile') {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;

    const file = e.target.files[0];

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      notify.error('Image must be less than 5MB');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      notify.error('Please select an image file');
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      setSelectedImage(event.target?.result as string);
      setCropperOpen(true);
    };

    reader.readAsDataURL(file);
  };

  const handleProfilePictureSave = async (croppedImage: string) => {
    if (!user) return;

    setProfilePictureLoading(true);
    setCropperOpen(false);

    const loadingToast = notify.loading('Uploading profile picture...');

    try {
      const response = await fetch(croppedImage);
      const blob = await response.blob();

      const token = document.cookie.split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];

      const formData = new FormData();
      formData.append('file', blob, 'profile-picture.jpg');

      const uploadResponse = await fetch(`${BASE_URL}/users/${user.id}/upload-pp`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload profile picture');
      }

      const { data } = await uploadResponse.json();

      // Update user data with new profile info from response
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);

      // Update cookie with the new user data
      document.cookie = `user=${encodeURIComponent(JSON.stringify(updatedUser))}; path=/`;

      // Dispatch custom event for real-time update
      const updateEvent = new CustomEvent('userUpdate', {
        detail: updatedUser
      });
      window.dispatchEvent(updateEvent);

      toast.dismiss(loadingToast);
      notify.success('Profile picture updated successfully!');
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      toast.dismiss(loadingToast);
      notify.error('Failed to upload profile picture');
    } finally {
      setProfilePictureLoading(false);
      setSelectedImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  if (!user) return;

  // ✅ Store form reference before any async/await
  const form = e.currentTarget;

  setPasswordLoading(true);

  const formData = new FormData(form);
  const currentPassword = formData.get('currentPassword') as string;
  const newPassword = formData.get('newPassword') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (newPassword !== confirmPassword) {
    notify.error('New passwords do not match');
    setPasswordLoading(false);
    return;
  }

  if (newPassword.length < 6) {
    notify.error('Password must be at least 6 characters long');
    setPasswordLoading(false);
    return;
  }

  const loadingToast = notify.loading('Changing password...');

  try {
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1];

    const response = await fetch(`${BASE_URL}/users/${user.id}/change-password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        oldPassword: currentPassword,
        newPassword: newPassword,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to change password');
    }

    toast.dismiss(loadingToast);
    notify.success('Password changed successfully!');

    // ✅ Use stored reference, safe after await
    form.reset();
  } catch (error: any) {
    console.error('Error changing password:', error);
    toast.dismiss(loadingToast);
    notify.error(error.message || 'Failed to change password');
  } finally {
    setPasswordLoading(false);
  }
};


  return (
    <div className={`bg-gray-50 px-6 pt-20 rounded-lg ${funnelSans.className}`}>
      <NotificationProvider />
      <AdminHeader user={user} />

      <div className="max-w-8xl mx-auto px-4 py-8">
        <div className="flex gap-1 mb-6 p-1 bg-gray-100 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-5 py-2.5 rounded-lg font-medium transition-all ${activeTab === 'profile' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Profile Picture
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-5 py-2.5 rounded-lg font-medium transition-all ${activeTab === 'security' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Password
          </button>
        </div>

        <Card className="p-4">
          {activeTab === 'profile' && (
            <div className="flex flex-col items-center md:flex-row md:items-start gap-8">
              <div className="md:w-1/2 flex flex-col items-center">
                <h2 className="text-xl font-semibold mb-8 mt-14 text-center">Change Profile Picture</h2>

                <div className="flex flex-col items-center max-w-sm w-full">
                  <div className="relative mb-6 group">
                    <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-white shadow-lg group-hover:shadow-xl transition-shadow">
                      <Image
                        src={user?.profilePictureUrl || '/default-avatar.png'}
                        alt="Profile"
                        width={192}
                        height={192}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <button
                      className="absolute bottom-2 right-2 bg-blue-600 text-white p-3 rounded-full shadow-md hover:bg-blue-700 hover:shadow-lg transition-all duration-200"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={profilePictureLoading}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                      </svg>
                    </button>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </div>

                  <p className="text-sm text-gray-500 text-center mb-4 max-w-[250px]">
                    Recommended: Square JPG, PNG or GIF, at least 200x200 pixels
                  </p>

                  {profilePictureLoading && (
                    <div className="flex items-center text-blue-600 bg-blue-50 px-4 py-2 rounded-full">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Uploading...
                    </div>
                  )}
                </div>
              </div>

              <div className="hidden md:block w-px h-96 bg-gray-200 mx-4" />

              <div className="md:w-1/2">
                <div className="aspect-square w-full max-w-md mx-auto bg-gray-100 rounded-xl overflow-hidden border-4 border-white shadow-lg">
                  <Image
                    src={user?.profilePictureUrl || '/default-avatar.png'}
                    alt="Profile Square View"
                    width={400}
                    height={400}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="max-w-8xl mx-auto">
              <h2 className="text-xl font-semibold mb-8 mt-2 ">Change Password</h2>

              <form onSubmit={handlePasswordChange} className="space-y-6">
                <div className="space-y-5">
                  <div>
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        name="currentPassword"
                        type={showPasswords.current ? 'text' : 'password'}
                        required
                        placeholder="Enter your current password"
                        className="pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.current ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                            <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        name="newPassword"
                        type={showPasswords.new ? 'text' : 'password'}
                        required
                        minLength={6}
                        placeholder="Enter your new password"
                        className="pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.new ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                            <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showPasswords.confirm ? 'text' : 'password'}
                        required
                        placeholder="Confirm your new password"
                        className="pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.confirm ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                            <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={passwordLoading}
                    className="w-full"
                  >
                    {passwordLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Changing Password...
                      </>
                    ) : 'Change Password'}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </Card>
      </div>

      {cropperOpen && selectedImage && (
        <ImageCropper
          image={selectedImage}
          onCrop={handleProfilePictureSave}
          onCancel={() => {
            setCropperOpen(false);
            setSelectedImage(null);
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
          }}
        />
      )}
    </div>
  );
}