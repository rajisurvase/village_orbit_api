import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, ArrowLeft, Eye, EyeOff, GripVertical, Plus, Trash2 } from 'lucide-react';
import { getDefaultNavigationConfig, NavigationConfig, NavMenuItem, HomeMenuSection } from '@/hooks/useNavigationConfig';
import { Json } from '@/integrations/supabase/types';

interface Village {
  id: string;
  name: string;
}

const NavigationConfigEditor = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [villages, setVillages] = useState<Village[]>([]);
  const [selectedVillage, setSelectedVillage] = useState<string>('');
  const [navConfig, setNavConfig] = useState<NavigationConfig>(getDefaultNavigationConfig());

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'Hindi (हिंदी)' },
    { code: 'mr', name: 'Marathi (मराठी)' }
  ];

  useEffect(() => {
    checkAdminAccess();
    fetchVillages();
  }, []);

  useEffect(() => {
    if (selectedVillage) {
      loadNavigationConfig();
    }
  }, [selectedVillage]);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .in('role', ['admin', 'sub_admin'])
        .maybeSingle();

      if (!roleData) {
        navigate('/');
        return;
      }

      setIsAdmin(true);
    } catch (error) {
      console.error('Error checking admin access:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchVillages = async () => {
    const { data, error } = await supabase
      .from('villages')
      .select('id, name')
      .eq('is_active', true)
      .order('name');

    if (!error && data) {
      setVillages(data);
    }
  };

  const loadNavigationConfig = async () => {
    try {
      setLoading(true);

      const { data: configData, error } = await supabase
        .from('village_config')
        .select('config_data')
        .eq('village_id', selectedVillage)
        .eq('language', 'en')
        .maybeSingle();

      if (error) {
        console.error('Error loading config:', error);
        setNavConfig(getDefaultNavigationConfig());
      } else if (configData?.config_data) {
        const data = configData.config_data as any;
        if (data.navigationConfig) {
          setNavConfig(data.navigationConfig);
        } else {
          setNavConfig(getDefaultNavigationConfig());
        }
      } else {
        setNavConfig(getDefaultNavigationConfig());
      }
    } catch (err) {
      console.error('Error in loadNavigationConfig:', err);
      setNavConfig(getDefaultNavigationConfig());
    } finally {
      setLoading(false);
    }
  };

  const updateStandaloneItem = (index: number, field: keyof NavMenuItem, value: any, lang?: string) => {
    setNavConfig(prev => {
      const updated = { ...prev };
      if (lang && field === 'label') {
        updated.standaloneItems[index].label = {
          ...updated.standaloneItems[index].label,
          [lang]: value
        };
      } else {
        (updated.standaloneItems[index] as any)[field] = value;
      }
      return updated;
    });
  };

  const updateHomeSection = (sectionIndex: number, field: keyof HomeMenuSection, value: any, lang?: string) => {
    setNavConfig(prev => {
      const updated = { ...prev };
      if (lang && field === 'title') {
        updated.homeMenuSections[sectionIndex].title = {
          ...updated.homeMenuSections[sectionIndex].title,
          [lang]: value
        };
      } else {
        (updated.homeMenuSections[sectionIndex] as any)[field] = value;
      }
      return updated;
    });
  };

  const updateHomeSectionItem = (sectionIndex: number, itemIndex: number, field: keyof NavMenuItem, value: any, lang?: string) => {
    setNavConfig(prev => {
      const updated = { ...prev };
      if (lang && field === 'label') {
        updated.homeMenuSections[sectionIndex].items[itemIndex].label = {
          ...updated.homeMenuSections[sectionIndex].items[itemIndex].label,
          [lang]: value
        };
      } else {
        (updated.homeMenuSections[sectionIndex].items[itemIndex] as any)[field] = value;
      }
      return updated;
    });
  };

  const addStandaloneItem = () => {
    const newItem: NavMenuItem = {
      id: `custom_${Date.now()}`,
      key: `custom_${Date.now()}`,
      label: { en: 'New Menu Item', hi: 'नया मेनू आइटम', mr: 'नवीन मेनू आयटम' },
      href: '/',
      pageKey: 'custom',
      isVisible: true,
      order: navConfig.standaloneItems.length + 1
    };
    setNavConfig(prev => ({
      ...prev,
      standaloneItems: [...prev.standaloneItems, newItem]
    }));
  };

  const removeStandaloneItem = (index: number) => {
    setNavConfig(prev => ({
      ...prev,
      standaloneItems: prev.standaloneItems.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    if (!selectedVillage) {
      toast({
        title: 'Error',
        description: 'Please select a village',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();

      // Get existing config
      const { data: existingConfig } = await supabase
        .from('village_config')
        .select('id, config_data')
        .eq('village_id', selectedVillage)
        .eq('language', 'en')
        .maybeSingle();

      const updatedConfigData = {
        ...(existingConfig?.config_data as Record<string, Json> || {}),
        navigationConfig: JSON.parse(JSON.stringify(navConfig)) as Json
      };

      if (existingConfig) {
        const { error } = await supabase
          .from('village_config')
          .update({
            config_data: updatedConfigData as Json,
            updated_by: user?.id,
            updated_at: new Date().toISOString(),
          })
          .eq('village_id', selectedVillage)
          .eq('language', 'en');

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('village_config')
          .insert([{
            village_id: selectedVillage,
            language: 'en',
            config_data: updatedConfigData as Json,
            updated_by: user?.id,
          }]);

        if (error) throw error;
      }

      toast({
        title: 'Success',
        description: 'Navigation configuration saved successfully. Changes will reflect immediately.',
      });
    } catch (error) {
      console.error('Error saving config:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save configuration',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const resetToDefault = () => {
    setNavConfig(getDefaultNavigationConfig());
    toast({
      title: 'Reset',
      description: 'Navigation reset to default. Click Save to apply changes.',
    });
  };

  if (loading && !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">Navigation Configuration</h1>
              <p className="text-sm text-muted-foreground">
                Manage header menu labels and translations
              </p>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" onClick={resetToDefault} className="flex-1 sm:flex-none">
              Reset Default
            </Button>
            <Button onClick={handleSave} disabled={saving || !selectedVillage} className="flex-1 sm:flex-none">
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Village Selector */}
        <Card className="mb-6">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Select Village</CardTitle>
            <CardDescription>Choose the village to configure navigation menu</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedVillage} onValueChange={setSelectedVillage}>
              <SelectTrigger className="w-full md:w-80">
                <SelectValue placeholder="Choose a village..." />
              </SelectTrigger>
              <SelectContent>
                {villages.map((village) => (
                  <SelectItem key={village.id} value={village.id}>
                    {village.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {selectedVillage && !loading && (
          <Tabs defaultValue="standalone" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="standalone">Main Menu Items</TabsTrigger>
              <TabsTrigger value="home">Home Dropdown</TabsTrigger>
            </TabsList>

            {/* Standalone Menu Items Tab */}
            <TabsContent value="standalone" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                  <div>
                    <CardTitle className="text-lg">Main Navigation Items</CardTitle>
                    <CardDescription>Configure the top-level menu items (Notices, Market Prices, etc.)</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={addStandaloneItem}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Item
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {navConfig.standaloneItems.map((item, index) => (
                    <Card key={item.id} className="border-border/50">
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-4">
                          <GripVertical className="h-5 w-5 text-muted-foreground mt-2 cursor-move hidden sm:block" />
                          <div className="flex-1 space-y-4">
                            {/* Visibility Toggle & Key */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <Switch
                                  checked={item.isVisible}
                                  onCheckedChange={(checked) => updateStandaloneItem(index, 'isVisible', checked)}
                                />
                                <Label className="text-sm font-medium">
                                  {item.isVisible ? <Eye className="h-4 w-4 inline mr-1" /> : <EyeOff className="h-4 w-4 inline mr-1" />}
                                  {item.isVisible ? 'Visible' : 'Hidden'}
                                </Label>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-destructive hover:text-destructive"
                                onClick={() => removeStandaloneItem(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>

                            {/* Labels for all languages */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              {languages.map(lang => (
                                <div key={lang.code} className="space-y-1">
                                  <Label className="text-xs text-muted-foreground">{lang.name}</Label>
                                  <Input
                                    value={item.label[lang.code as keyof typeof item.label]}
                                    onChange={(e) => updateStandaloneItem(index, 'label', e.target.value, lang.code)}
                                    placeholder={`Label in ${lang.name}`}
                                  />
                                </div>
                              ))}
                            </div>

                            {/* Link/URL */}
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">Link URL</Label>
                              <Input
                                value={item.href}
                                onChange={(e) => updateStandaloneItem(index, 'href', e.target.value)}
                                placeholder="/page-url"
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Home Menu Sections Tab */}
            <TabsContent value="home" className="space-y-4">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Home Dropdown Sections</CardTitle>
                  <CardDescription>Configure the HOME menu dropdown sections and their items</CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="multiple" className="space-y-4">
                    {navConfig.homeMenuSections.map((section, sectionIndex) => (
                      <AccordionItem key={section.id} value={section.id} className="border rounded-lg px-4">
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center gap-3">
                            <Switch
                              checked={section.isVisible}
                              onCheckedChange={(checked) => {
                                updateHomeSection(sectionIndex, 'isVisible', checked);
                              }}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <span className="font-medium">{section.title.en}</span>
                            <span className="text-xs text-muted-foreground">
                              ({section.items.length} items)
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-4 space-y-4">
                          {/* Section Title Translations */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-muted/50 rounded-lg">
                            <Label className="col-span-full text-sm font-medium mb-2">Section Title</Label>
                            {languages.map(lang => (
                              <div key={lang.code} className="space-y-1">
                                <Label className="text-xs text-muted-foreground">{lang.name}</Label>
                                <Input
                                  value={section.title[lang.code as keyof typeof section.title]}
                                  onChange={(e) => updateHomeSection(sectionIndex, 'title', e.target.value, lang.code)}
                                  placeholder={`Title in ${lang.name}`}
                                />
                              </div>
                            ))}
                          </div>

                          {/* Section Items */}
                          <div className="space-y-3">
                            <Label className="text-sm font-medium">Menu Items</Label>
                            {section.items.map((item, itemIndex) => (
                              <Card key={item.id} className="border-border/50">
                                <CardContent className="pt-4 space-y-3">
                                  <div className="flex items-center gap-3">
                                    <Switch
                                      checked={item.isVisible}
                                      onCheckedChange={(checked) => updateHomeSectionItem(sectionIndex, itemIndex, 'isVisible', checked)}
                                    />
                                    <Label className="text-sm">
                                      {item.isVisible ? 'Visible' : 'Hidden'}
                                    </Label>
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {languages.map(lang => (
                                      <div key={lang.code} className="space-y-1">
                                        <Label className="text-xs text-muted-foreground">{lang.name}</Label>
                                        <Input
                                          value={item.label[lang.code as keyof typeof item.label]}
                                          onChange={(e) => updateHomeSectionItem(sectionIndex, itemIndex, 'label', e.target.value, lang.code)}
                                          placeholder={`Label in ${lang.name}`}
                                        />
                                      </div>
                                    ))}
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground">Link URL</Label>
                                    <Input
                                      value={item.href}
                                      onChange={(e) => updateHomeSectionItem(sectionIndex, itemIndex, 'href', e.target.value)}
                                      placeholder="/page-url"
                                    />
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {selectedVillage && loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
};

export default NavigationConfigEditor;
