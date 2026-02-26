
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Image as ImageIcon, Send, X, Plus, Info } from 'lucide-react'
import toast from 'react-hot-toast'
import { getImageUrl } from '@/lib/utils'
import { getAvatarFallback } from '@/lib/display-name-utils'

interface CreatePostFormProps {
  currentUser: any
  onPostCreated: (post: any) => void
}

export default function CreatePostForm({ currentUser, onPostCreated }: CreatePostFormProps) {
  const [content, setContent] = useState('')
  const [sourceCitation, setSourceCitation] = useState('')
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [politicalTags, setPoliticalTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const availableTags = [
    'environment', 'economy', 'healthcare', 'education', 'immigration',
    'defense', 'taxes', 'social-issues', 'foreign-policy', 'civil-rights',
    'technology', 'energy', 'trade', 'infrastructure', 'criminal-justice',
    'reproductive-health', 'medical-autonomy', 'informed-consent', 
    'healthcare-access', 'mens-health', 'womens-health', 'elections',
    '12th-amendment', '22nd-amendment'
  ]

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size must be less than 5MB')
        return
      }
      setSelectedImage(file)
    }
  }

  const addTag = (tag: string) => {
    if (tag && !politicalTags?.includes(tag)) {
      setPoliticalTags([...politicalTags, tag])
    }
  }

  const removeTag = (tagToRemove: string) => {
    setPoliticalTags(politicalTags?.filter(tag => tag !== tagToRemove))
  }

  const addCustomTag = () => {
    if (newTag?.trim()) {
      addTag(newTag.trim().toLowerCase())
      setNewTag('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content?.trim() || isSubmitting) return

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('content', content)
      formData.append('sourceCitation', sourceCitation)
      formData.append('politicalTags', JSON.stringify(politicalTags))
      formData.append('isAnonymous', String(isAnonymous))
      
      if (selectedImage) {
        formData.append('image', selectedImage)
      }

      const response = await fetch('/api/posts', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const newPost = await response.json()
        onPostCreated(newPost)
        
        // Reset form
        setContent('')
        setSourceCitation('')
        setPoliticalTags([])
        setSelectedImage(null)
        
        toast.success('Post created successfully!')
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to create post')
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarImage src={getImageUrl(currentUser?.profileImage) || getImageUrl(currentUser?.image)} />
            <AvatarFallback>
              {getAvatarFallback(currentUser)}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg">
              {isAnonymous ? 'Post Anonymously' : 'Share your thoughts'}
            </CardTitle>
            <p className="text-sm text-gray-600">
              {isAnonymous 
                ? 'Your identity will be hidden'
                : 'Start a respectful political discussion'}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">What's on your mind?</Label>
            <Textarea
              id="content"
              placeholder="Share your political thoughts, insights, or questions. Remember to be respectful and constructive."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px] resize-y"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Be respectful and fact-based in your discussions</span>
              <span>{content?.length ?? 0} characters</span>
            </div>
          </div>

          {/* Source Citation */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="source">Source Citation (Optional)</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-gray-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-sm">
                      Only one source link can be added per post to maintain clean, focused discussions. 
                      For multiple sources, consider including them within your post text or adding a comment with additional references.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="source"
              type="url"
              placeholder="https://example.com/article"
              value={sourceCitation}
              onChange={(e) => setSourceCitation(e.target.value)}
            />
            <p className="text-xs text-gray-500">
              Add a source to support your claims and help with fact-checking
            </p>
          </div>

          {/* Political Tags */}
          <div className="space-y-3">
            <Label>Political Tags</Label>
            
            {/* Selected Tags */}
            {politicalTags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {politicalTags?.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {/* Add Tags */}
            <div className="grid grid-cols-2 gap-2">
              <Select value="" onValueChange={(value) => addTag(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Add political tag..." />
                </SelectTrigger>
                <SelectContent>
                  {availableTags?.filter(tag => !politicalTags?.includes(tag))?.map((tag) => (
                    <SelectItem key={tag} value={tag}>
                      #{tag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex space-x-2">
                <Input
                  placeholder="Custom tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomTag())}
                />
                <Button 
                  type="button" 
                  size="sm" 
                  onClick={addCustomTag}
                  disabled={!newTag?.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="image">Image (Optional)</Label>
            <div className="flex items-center space-x-2">
              <input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('image')?.click()}
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                Add Image
              </Button>
              {selectedImage && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{selectedImage.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedImage(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Anonymous Posting Option */}
          <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="anonymous"
                checked={isAnonymous}
                onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
              />
              <Label htmlFor="anonymous" className="text-sm font-medium cursor-pointer">
                Post anonymously
              </Label>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {isAnonymous 
                ? "Your identity will be hidden from other users. Only admins can see the author for moderation."
                : "Your name and profile will be visible with this post."}
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-xs text-gray-500">
              Posts are subject to community moderation guidelines
            </div>
            <Button 
              type="submit" 
              disabled={!content?.trim() || isSubmitting}
              className="flex items-center space-x-2"
            >
              <Send className="h-4 w-4" />
              <span>{isSubmitting ? 'Posting...' : 'Post'}</span>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
