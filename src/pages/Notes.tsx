import { useState, useEffect } from 'react';
import AppLayout from '@/components/Layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, Edit, Search, Cloud, CloudOff } from 'lucide-react';
import { Note, noteStorage } from '@/lib/storage';
import { supabaseNoteStorage } from '@/lib/supabaseStorage';
import { useToast } from '@/hooks/use-toast';

const Notes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    setIsLoading(true);
    try {
      const supabaseNotes = await supabaseNoteStorage.getAll();
      if (supabaseNotes.length > 0) {
        setNotes(supabaseNotes);
        noteStorage.set(supabaseNotes);
        setIsOnline(true);
      } else {
        setNotes(noteStorage.getAll());
      }
    } catch (error) {
      console.error('Error loading from Supabase:', error);
      setNotes(noteStorage.getAll());
      setIsOnline(false);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      tags: '',
    });
    setEditingNote(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a note title',
        variant: 'destructive',
      });
      return;
    }

    const tags = formData.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    setIsLoading(true);
    try {
      if (editingNote) {
        await supabaseNoteStorage.update(editingNote.id, {
          title: formData.title,
          content: formData.content,
          tags,
        });
        noteStorage.update(editingNote.id, {
          title: formData.title,
          content: formData.content,
          tags,
        });
        toast({
          title: 'Note updated',
          description: '✅ Saved to cloud',
        });
      } else {
        const newNote: Note = {
          id: Date.now().toString(),
          title: formData.title,
          content: formData.content,
          tags,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await supabaseNoteStorage.add(newNote);
        noteStorage.add(newNote);
        toast({
          title: 'Note created',
          description: '✅ Saved to cloud',
        });
      }
      setIsOnline(true);
    } catch (error) {
      console.error('Error saving to Supabase:', error);
      if (editingNote) {
        noteStorage.update(editingNote.id, {
          title: formData.title,
          content: formData.content,
          tags,
        });
      } else {
        const newNote: Note = {
          id: Date.now().toString(),
          title: formData.title,
          content: formData.content,
          tags,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        noteStorage.add(newNote);
      }
      setIsOnline(false);
      toast({
        title: editingNote ? 'Note updated' : 'Note created',
        description: '⚠️ Saved locally (offline)',
      });
    } finally {
      setIsLoading(false);
      loadNotes();
      resetForm();
      setIsDialogOpen(false);
    }
  };

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setFormData({
      title: note.title,
      content: note.content,
      tags: note.tags.join(', '),
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await supabaseNoteStorage.delete(id);
      noteStorage.delete(id);
      toast({
        title: 'Note deleted',
        description: '✅ Removed from cloud',
      });
    } catch (error) {
      console.error('Error deleting from Supabase:', error);
      noteStorage.delete(id);
      toast({
        title: 'Note deleted',
        description: '⚠️ Removed locally',
      });
    }
    loadNotes();
  };

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6 animate-fade-in">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Notes
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-muted-foreground">{notes.length} total notes</p>
              <div className="flex items-center gap-1 text-xs">
                {isOnline ? (
                  <>
                    <Cloud className="w-3 h-3 text-green-500" />
                    <span className="text-green-500">Cloud synced</span>
                  </>
                ) : (
                  <>
                    <CloudOff className="w-3 h-3 text-amber-500" />
                    <span className="text-amber-500">Offline mode</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2">
                <Plus className="w-5 h-5" />
                New Note
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>{editingNote ? 'Edit Note' : 'Create New Note'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Input
                    placeholder="Note title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div>
                  <Textarea
                    placeholder="Write your note..."
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="min-h-[200px]"
                  />
                </div>
                <div>
                  <Input
                    placeholder="Tags (comma separated)"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    {editingNote ? 'Update' : 'Create'} Note
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      resetForm();
                      setIsDialogOpen(false);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.length === 0 ? (
            <Card className="glass md:col-span-2 lg:col-span-3">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  {searchQuery ? 'No notes found matching your search.' : 'No notes yet. Create your first note to get started!'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredNotes.map((note, index) => (
              <Card
                key={note.id}
                className="glass hover:shadow-lg transition-all animate-scale-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg line-clamp-1">{note.title}</CardTitle>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(note)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(note.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm line-clamp-3 mb-3">
                    {note.content || 'No content'}
                  </p>
                  {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {note.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-3">
                    Updated {new Date(note.updatedAt).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Notes;
