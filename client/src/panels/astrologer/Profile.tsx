import { useRef, useState, useEffect } from 'react';
import { User, Save, Upload, ImageIcon, Loader2, X, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/Auth';
import { apiFetch, mediaUrl } from '../../config/api';
import toast from 'react-hot-toast';

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const blobUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(blobUrl);
      const max = 1200;
      let { width, height } = img;
      if (width > max || height > max) {
        if (width >= height) {
          height = Math.round((height * max) / width);
          width = max;
        } else {
          width = Math.round((width * max) / height);
          height = max;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not process image'));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
      resolve(dataUrl);
    };
    img.onerror = () => {
      URL.revokeObjectURL(blobUrl);
      reject(new Error('Could not read image file'));
    };
    img.src = blobUrl;
  });
}

function splitTags(value: string): string[] {
  return value.split(/[,|\n]/).map(s => s.trim()).filter(Boolean);
}

function joinTags(items?: string[]): string {
  return (items || []).join(', ');
}

interface ProfileForm {
  full_name: string;
  bio: string;
  experience: number;
  education: string;
  expertise: string;
  languages: string;
  skills: string;
  certifications: string;
  services: string;
  avatar_url: string;
  gallery_images: string[];
}

export default function AstroProfile() {
  const { token, refreshUser } = useAuth();
  const avatarRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [newService, setNewService] = useState('');
  const [serviceList, setServiceList] = useState<string[]>([]);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [form, setForm] = useState<ProfileForm>({
    full_name: '',
    bio: '',
    experience: 0,
    education: '',
    expertise: '',
    languages: 'Hindi, English',
    skills: '',
    certifications: '',
    services: '',
    avatar_url: '',
    gallery_images: [],
  });

  useEffect(() => {
    if (!token) return;
    apiFetch('/astrologers/me/profile', {}, token)
      .then((p: any) => {
        const services = p.services || [];
        setServiceList(services);
        setForm({
          full_name: p.full_name || '',
          bio: p.bio || '',
          experience: p.experience || 0,
          education: p.education || '',
          expertise: joinTags(p.expertise),
          languages: joinTags(p.languages),
          skills: joinTags(p.skills),
          certifications: joinTags(p.certifications),
          services: joinTags(services),
          avatar_url: p.avatar_url || p.documents?.profile_photo_url || '',
          gallery_images: p.gallery_images || [],
        });
      })
      .catch((e: any) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  const uploadImage = async (file: File) => {
    if (!file.type.startsWith('image/') && !/\.(jpe?g|png|webp|gif)$/i.test(file.name)) {
      throw new Error('Only image files allowed (JPG, PNG, WEBP)');
    }
    const dataUrl = await compressImage(file);
    const res = await apiFetch('/upload/astrologer-image', {
      method: 'POST',
      body: JSON.stringify({ image: dataUrl }),
    }, token);
    return (res.url || dataUrl) as string;
  };

  const handleAvatarUpload = async (files: FileList | null) => {
    if (!files?.[0] || !token) return;
    const file = files[0];
    const localPreview = URL.createObjectURL(file);
    setAvatarPreview(localPreview);
    setUploadingAvatar(true);
    try {
      const url = await uploadImage(file);
      setForm(f => ({ ...f, avatar_url: url }));
      setAvatarPreview(url.startsWith('data:') ? url : mediaUrl(url));
      toast.success('Profile photo uploaded — click Save Profile below');
    } catch (e: any) {
      toast.error(e.message || 'Upload failed');
      setAvatarPreview('');
    } finally {
      setUploadingAvatar(false);
      URL.revokeObjectURL(localPreview);
      if (avatarRef.current) avatarRef.current.value = '';
    }
  };

  const handleGalleryUpload = async (files: FileList | null) => {
    if (!files?.length || !token) return;
    setUploadingGallery(true);
    let added = 0;
    try {
      for (const file of Array.from(files)) {
        const local = URL.createObjectURL(file);
        setForm(f => ({ ...f, gallery_images: [...f.gallery_images, local] }));
        try {
          const url = await uploadImage(file);
          setForm(f => ({
            ...f,
            gallery_images: f.gallery_images.map((img) => (img === local ? url : img)),
          }));
          added += 1;
        } catch (err) {
          setForm(f => ({ ...f, gallery_images: f.gallery_images.filter((img) => img !== local) }));
          throw err;
        } finally {
          URL.revokeObjectURL(local);
        }
      }
      toast.success(`${added} photo(s) added — click Save Profile below`);
    } catch (e: any) {
      toast.error(e.message || 'Upload failed');
    } finally {
      setUploadingGallery(false);
      if (galleryRef.current) galleryRef.current.value = '';
    }
  };

  const addService = () => {
    const text = newService.trim();
    if (!text) return;
    setServiceList(prev => [...prev, text]);
    setNewService('');
  };

  const removeService = (idx: number) => {
    setServiceList(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (!form.bio.trim()) {
      toast.error('Bio is required — tell users about yourself');
      return;
    }
    setSaving(true);
    try {
      await apiFetch('/astrologers/profile', {
        method: 'PATCH',
        body: JSON.stringify({
          full_name: form.full_name.trim(),
          bio: form.bio.trim(),
          experience: form.experience,
          education: form.education.trim(),
          expertise: splitTags(form.expertise),
          languages: splitTags(form.languages),
          skills: splitTags(form.skills),
          certifications: splitTags(form.certifications),
          services: serviceList,
          avatar_url: form.avatar_url,
          gallery_images: form.gallery_images,
          documents: { profile_photo_url: form.avatar_url },
        }),
      }, token);
      await refreshUser();
      toast.success('Profile saved! Users can now see your updated profile.');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const avatarSrc = avatarPreview
    || (form.avatar_url ? mediaUrl(form.avatar_url) : '')
    || `https://ui-avatars.com/api/?name=${encodeURIComponent(form.full_name || 'A')}&background=d97706&color=fff&size=200`;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center">
          <User className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-500 text-sm">Upload photo, bio & details — shown to all users on the website</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6 max-w-3xl">
        {/* Profile photo */}
        <section className="bg-white rounded-2xl border border-amber-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Profile Photo</h2>
          <div className="flex flex-col sm:flex-row items-start gap-5">
            <img src={avatarSrc} alt="Profile" className="w-28 h-28 rounded-2xl object-cover border-2 border-amber-200 shadow-md" />
            <div>
              <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={e => handleAvatarUpload(e.target.files)} />
              <button
                type="button"
                onClick={() => avatarRef.current?.click()}
                disabled={uploadingAvatar}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-600 text-white rounded-xl text-sm font-medium hover:bg-amber-700 disabled:opacity-60"
              >
                {uploadingAvatar ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {uploadingAvatar ? 'Uploading...' : 'Upload Photo'}
              </button>
              <p className="text-xs text-gray-500 mt-2">JPG, PNG or WEBP — max 2MB. Upload ke baad &quot;Save Profile&quot; zaroor dabao.</p>
            </div>
          </div>
        </section>

        {/* Basic info */}
        <section className="bg-white rounded-2xl border border-amber-100 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">About You</h2>
          <div>
            <label className="text-sm font-medium text-gray-700">Full Name</label>
            <input
              value={form.full_name}
              onChange={e => setForm({ ...form, full_name: e.target.value })}
              className="w-full mt-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Bio — Apne baare mein likho</label>
            <textarea
              value={form.bio}
              onChange={e => setForm({ ...form, bio: e.target.value })}
              rows={5}
              placeholder="Main 10 saal se Vedic astrology practice karta/karti hoon. Kundli, marriage, career aur health guidance deta/deti hoon..."
              className="w-full mt-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400 resize-none"
              required
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Experience (years)</label>
              <input
                type="number"
                min={0}
                value={form.experience}
                onChange={e => setForm({ ...form, experience: parseInt(e.target.value) || 0 })}
                className="w-full mt-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Education</label>
              <input
                value={form.education}
                onChange={e => setForm({ ...form, education: e.target.value })}
                placeholder="e.g. Jyotish Acharya, Delhi"
                className="w-full mt-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm"
              />
            </div>
          </div>
        </section>

        {/* Services - what I do */}
        <section className="bg-white rounded-2xl border border-amber-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-1">Services — Main ye kaam karta/karti hoon</h2>
          <p className="text-xs text-gray-500 mb-4">Add each service separately (Kundli, Marriage, Career, etc.)</p>
          <div className="flex gap-2 mb-3">
            <input
              value={newService}
              onChange={e => setNewService(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addService(); } }}
              placeholder="e.g. Kundli Matching"
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm"
            />
            <button type="button" onClick={addService} className="px-4 py-2.5 bg-amber-100 text-amber-800 rounded-xl text-sm font-medium hover:bg-amber-200">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          {serviceList.length > 0 ? (
            <ul className="space-y-2">
              {serviceList.map((s, i) => (
                <li key={i} className="flex items-center justify-between px-4 py-2.5 bg-amber-50 rounded-xl text-sm">
                  <span>{s}</span>
                  <button type="button" onClick={() => removeService(i)} className="text-red-500 hover:text-red-700 p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400 italic">No services added yet</p>
          )}
        </section>

        {/* Expertise & skills */}
        <section className="bg-white rounded-2xl border border-amber-100 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Expertise & Skills</h2>
          <div>
            <label className="text-sm font-medium text-gray-700">Expertise (comma separated)</label>
            <input value={form.expertise} onChange={e => setForm({ ...form, expertise: e.target.value })} placeholder="Vedic Astrology, Numerology, Tarot" className="w-full mt-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Languages (comma separated)</label>
            <input value={form.languages} onChange={e => setForm({ ...form, languages: e.target.value })} placeholder="Hindi, English, Punjabi" className="w-full mt-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Skills (comma separated)</label>
            <input value={form.skills} onChange={e => setForm({ ...form, skills: e.target.value })} placeholder="Kundli Reading, Muhurat, Remedies" className="w-full mt-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Certifications (comma separated)</label>
            <input value={form.certifications} onChange={e => setForm({ ...form, certifications: e.target.value })} placeholder="Jyotish Visharad, Certified Tarot Reader" className="w-full mt-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm" />
          </div>
        </section>

        {/* Gallery */}
        <section className="bg-white rounded-2xl border border-amber-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-1">Photo Gallery</h2>
          <p className="text-xs text-gray-500 mb-4">Upload multiple photos — certificates, workspace, etc.</p>
          <input ref={galleryRef} type="file" accept="image/*" multiple className="hidden" onChange={e => handleGalleryUpload(e.target.files)} />
          <button
            type="button"
            onClick={() => galleryRef.current?.click()}
            disabled={uploadingGallery}
            className="inline-flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-amber-300 text-amber-700 rounded-xl text-sm font-medium hover:bg-amber-50 disabled:opacity-60 mb-4"
          >
            {uploadingGallery ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
            {uploadingGallery ? 'Uploading...' : 'Add Photos (multiple)'}
          </button>
          {form.gallery_images.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {form.gallery_images.map((url, i) => (
                <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200">
                  <img src={url.startsWith('blob:') || url.startsWith('data:') ? url : mediaUrl(url)} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, gallery_images: f.gallery_images.filter((_, j) => j !== i) }))}
                    className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">No gallery photos yet</p>
          )}
        </section>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 bg-amber-600 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-amber-700 disabled:opacity-60 shadow-lg shadow-amber-200"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Profile — Show on Website'}
        </button>
      </form>
    </div>
  );
}