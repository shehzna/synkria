import { Navbar } from '@/components/Navbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { updateUser } from '@/store/slices/authSlice';
import { setEditing, updateProfile } from '@/store/slices/userSlice';
import { userService } from '@/services/userService';
import { notificationService } from '@/services/notificationService';
import { useState, useRef, useEffect } from 'react';
import { Camera, Save, X, User as UserIcon, Calendar, Clock } from 'lucide-react';
import { toast } from 'sonner';

export const ProfilePage = () => {
  const dispatch = useAppDispatch();
  const { user, token } = useAppSelector((state) => state.auth);
  const { isEditing } = useAppSelector((state) => state.user);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    age: user?.age?.toString() || '',
    cycleLength: user?.cycleLength?.toString() || '28',
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [upcomingPrediction, setUpcomingPrediction] = useState<{
    message: string;
    predicted_date: string;
    days_until: number;
  } | null>(null);

  // Fetch upcoming prediction
  useEffect(() => {
    const fetchPrediction = async () => {
      if (token) {
        try {
          const prediction = await notificationService.checkImminentPrediction(token);
          setUpcomingPrediction(prediction);
        } catch (error) {
          console.error('Failed to fetch prediction:', error);
        }
      }
    };
    fetchPrediction();
  }, [token]);

  const handleEdit = () => {
    dispatch(setEditing(true));
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      age: user?.age?.toString() || '',
      cycleLength: user?.cycleLength?.toString() || '28',
    });
    setAvatarPreview(null);
    dispatch(setEditing(false));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updates = {
        name: formData.name,
        email: formData.email,
        age: formData.age ? parseInt(formData.age) : undefined,
        cycleLength: formData.cycleLength ? parseInt(formData.cycleLength) : 28,
        avatar: avatarPreview || user?.avatar,
      };

      dispatch(updateUser(updates));
      dispatch(updateProfile(updates));
      dispatch(setEditing(false));
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarClick = () => {
    if (isEditing) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = await userService.uploadAvatar(user?.id || '', file);
      setAvatarPreview(url);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container py-8">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="animate-fade-in">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Profile
            </h1>
            <p className="text-muted-foreground">
              Manage your account settings and preferences
            </p>
          </div>

          <Card className="p-8 border border-border shadow-card">
            {/* Avatar Section */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative">
                <Avatar
                  className="w-24 h-24 cursor-pointer transition-transform hover:scale-105"
                  onClick={handleAvatarClick}
                >
                  <AvatarImage
                    src={avatarPreview || user?.avatar || userService.generateDefaultAvatar(user?.name || 'User')}
                  />
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                    {getInitials(user?.name || 'U')}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <button
                    onClick={handleAvatarClick}
                    className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors"
                  >
                    <Camera className="w-4 h-4 text-primary-foreground" />
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
              <h2 className="mt-4 text-xl font-semibold text-foreground">
                {user?.name}
              </h2>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>

            {/* Profile Form */}
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={!isEditing}
                    className="disabled:opacity-70"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={!isEditing}
                    className="disabled:opacity-70"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Enter your age"
                    className="disabled:opacity-70"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cycleLength">Average Cycle Length (days)</Label>
                  <Input
                    id="cycleLength"
                    type="number"
                    value={formData.cycleLength}
                    onChange={(e) => setFormData({ ...formData, cycleLength: e.target.value })}
                    disabled={!isEditing}
                    min={21}
                    max={35}
                    className="disabled:opacity-70"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3 justify-end">
                {isEditing ? (
                  <>
                    <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                      <Save className="w-4 h-4 mr-2" />
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </>
                ) : (
                  <Button onClick={handleEdit}>
                    <UserIcon className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Upcoming Period Prediction */}
          {upcomingPrediction && (
            <Card className="p-6 border-2 border-primary/20 shadow-lg bg-gradient-to-br from-primary/5 to-primary/10">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    Upcoming Period
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Based on your cycle prediction
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="flex items-center gap-2 p-3 bg-background/50 rounded-lg">
                      <Calendar className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Predicted Date</p>
                        <p className="font-semibold text-foreground">
                          {new Date(upcomingPrediction.predicted_date).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-background/50 rounded-lg">
                      <Clock className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Days Until</p>
                        <p className="font-semibold text-foreground">
                          {upcomingPrediction.days_until === 0
                            ? 'Today'
                            : upcomingPrediction.days_until === 1
                              ? 'Tomorrow'
                              : `${upcomingPrediction.days_until} days`}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Account Stats */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="p-6 border border-border shadow-card text-center">
              <div className="text-3xl font-bold text-primary mb-1">
                {user?.cycleLength || 28}
              </div>
              <p className="text-sm text-muted-foreground">Cycle Length</p>
            </Card>
            <Card className="p-6 border border-border shadow-card text-center">
              <div className="text-3xl font-bold text-primary mb-1">12</div>
              <p className="text-sm text-muted-foreground">Cycles Tracked</p>
            </Card>
            <Card className="p-6 border border-border shadow-card text-center">
              <div className="text-3xl font-bold text-success mb-1">94%</div>
              <p className="text-sm text-muted-foreground">Prediction Accuracy</p>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};
