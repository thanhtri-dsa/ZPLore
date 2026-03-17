'use client'
import React, { useState, ChangeEvent, FormEvent } from 'react';
import { Save, Upload } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Image from 'next/image';

interface FormData {
    name: string;
    email: string;
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
    role: string;
    lastLogin: string;
    profileImage: string;
}

const AdminSettingsForm = () => {
    const [formData, setFormData] = useState<FormData>({
        name: 'Admin User',
        email: 'admin@company.com',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        role: 'Super Admin',
        lastLogin: '2024-03-28 14:30:00',
        profileImage: '/images/avatar.svg'
    });

    const [saveStatus, setSaveStatus] = useState<string>('');
    const [imagePreview, setImagePreview] = useState<string>(formData.profileImage);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Check file type
            if (!file.type.startsWith('image/')) {
                alert('Please upload an image file');
                return;
            }

            // Check file size (limit to 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('File size should be less than 5MB');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setImagePreview(result);
                setFormData(prev => ({
                    ...prev,
                    profileImage: result
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Validate passwords match if changing password
        if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
            alert('New passwords do not match');
            return;
        }

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            setSaveStatus('success');
            setTimeout(() => setSaveStatus(''), 3000);
            console.log('Settings updated:', formData);
        } catch (error) {
            setSaveStatus('error');
            console.error('Error updating settings:', error);
        }
    };

    return (
        <div className="min-h-screen bg-background p-4 lg:p-6">
            <div className="max-w-3xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Admin Settings</h1>
                    <div className="text-sm text-gray-500">
                        Last login: {formData.lastLogin}
                    </div>
                </div>

                {saveStatus === 'success' && (
                    <Alert className="mb-4 bg-green-50 text-green-800">
                        <AlertDescription>
                            Settings updated successfully
                        </AlertDescription>
                    </Alert>
                )}

                <div className="space-y-6">
                    {/* Profile Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="flex items-center space-x-4 mb-6">
                                    <div className="relative">
                                        <Image
                                            src={imagePreview}
                                            alt="Admin"
                                            width={80}
                                            height={80}
                                            className="rounded-full object-cover border-2 border-gray-200"
                                            priority
                                        />
                                        <label htmlFor="imageUpload">
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="secondary"
                                                className="absolute bottom-0 right-0 rounded-full p-1.5 cursor-pointer"
                                            >
                                                <Upload className="w-4 h-4" />
                                            </Button>
                                        </label>
                                        <input
                                            id="imageUpload"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleImageUpload}
                                        />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Update your admin profile picture (max 5MB)
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address</Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="role">Role</Label>
                                        <Input
                                            id="role"
                                            name="role"
                                            value={formData.role}
                                            disabled
                                            className="bg-gray-50"
                                        />
                                    </div>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Security Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Security Settings</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="currentPassword">Current Password</Label>
                                    <Input
                                        id="currentPassword"
                                        name="currentPassword"
                                        type="password"
                                        value={formData.currentPassword}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="newPassword">New Password</Label>
                                        <Input
                                            id="newPassword"
                                            name="newPassword"
                                            type="password"
                                            value={formData.newPassword}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                        <Input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type="password"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <Button type="submit" className="flex items-center gap-2">
                                        <Save className="w-4 h-4" />
                                        Save Changes
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default AdminSettingsForm;