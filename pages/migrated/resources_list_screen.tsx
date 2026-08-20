import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Box } from '@components/ui/box';
import { Text } from '@components/ui/text';
import { Heading } from '@components/ui/heading';
import { Button } from '@components/ui/button';
import { Pressable } from '@components/ui/pressable';
import { Icon } from '@components/ui/icon';
import { C } from './theme';
import { resourcesApi, ResourceListItem, ResourceCategory } from '../../api/resources';

type Tab = 'mine' | 'shared';

// Sub-secciones que se muestran dentro de cada pestaña, en este orden fijo.
const SHARED_SECTIONS: { key: ResourceCategory; label: string }[] = [
  { key: 'entrenamiento', label: 'Entrenamiento' },
  { key: 'nutricion', label: 'Nutrición' },
  { key: 'habitos_mindset', label: 'Hábitos y Mindset' },
];

const MINE_SECTIONS: { key: ResourceCategory; label: string }[] = [
  { key: 'onboarding', label: 'Onboarding' },
  { key: 'planes_actuales', label: 'Tus planes actuales' },
];

const OTHER_LABEL = 'Otros';

const TYPE_ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
  article: 'document-text-outline',
  video: 'play-circle-outline',
  link: 'link-outline',
  doc: 'reader-outline',
};

const TYPE_COLOR: Record<string, string> = {
  article: C.blue60,
  video: C.warning60,
  link: C.purple60,
  doc: C.success60,
};

interface Props {
  navigation?: any;
}

export default function ResourcesListScreen(props: Props) {
  const { navigation } = props;
  const [activeTab, setActiveTab] = useState<Tab>('mine');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [items, setItems] = useState<ResourceListItem[]>([]);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(false);
    try {
      const res = await resourcesApi.getList({ per_page: 100 });
      setItems(res.data?.data ?? []);
    } catch (e) {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const mine = useMemo(() => items.filter((i) => i.scope === 'assigned'), [items]);
  const shared = useMemo(() => items.filter((i) => i.scope === 'shared'), [items]);
  const activeList = activeTab === 'mine' ? mine : shared;
  const sectionDefs = activeTab === 'mine' ? MINE_SECTIONS : SHARED_SECTIONS;

  const sections = useMemo(() => {
    const known = sectionDefs.map((s) => ({
      label: s.label,
      data: activeList.filter((i) => i.category === s.key),
    }));
    const knownKeys = new Set(sectionDefs.map((s) => s.key));
    const rest = activeList.filter((i) => !knownKeys.has(i.category as ResourceCategory));
    return rest.length > 0 ? [...known, { label: OTHER_LABEL, data: rest }] : known;
  }, [activeList, sectionDefs]);

  const openResource = (item: ResourceListItem) => {
    navigation?.navigate('MigratedResourceDetail', { resourceId: item.id, title: item.title });
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-background" edges={['bottom']}>
      <Box style={{ paddingTop: 12, paddingBottom: 12 }} className="flex-row items-center justify-between px-5">
        <Button variant="ghost" size="icon" onPress={() => navigation?.goBack()}>
          <Icon name="chevron-back" size={24} className="text-foreground" />
        </Button>
        <Heading size="sm">Recursos</Heading>
        <Box className="w-10" />
      </Box>

      <Box className="flex-row gap-2 px-5" style={{ marginBottom: 16 }}>
        <Pressable
          className={`flex-1 py-2.5 rounded-md items-center ${activeTab === 'mine' ? 'bg-primary' : 'bg-secondary'}`}
          onPress={() => setActiveTab('mine')}
        >
          <Text weight="semibold" size="sm" className={activeTab === 'mine' ? 'text-primary-foreground' : 'text-muted-foreground'}>
            Mis Recursos
          </Text>
        </Pressable>
        <Pressable
          className={`flex-1 py-2.5 rounded-md items-center ${activeTab === 'shared' ? 'bg-primary' : 'bg-secondary'}`}
          onPress={() => setActiveTab('shared')}
        >
          <Text weight="semibold" size="sm" className={activeTab === 'shared' ? 'text-primary-foreground' : 'text-muted-foreground'}>
            Compartidos
          </Text>
        </Pressable>
      </Box>

      {isLoading ? (
        <Box className="flex-1 items-center justify-center" style={{ paddingTop: 60 }}>
          <ActivityIndicator size="large" color="#000000" />
        </Box>
      ) : error ? (
        <Box className="flex-1 items-center justify-center" style={{ paddingTop: 60 }}>
          <Text muted className="text-center px-8">No se pudieron cargar los recursos.</Text>
        </Box>
      ) : (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
          {activeList.length === 0 ? (
            <Box className="flex-1 items-center justify-center" style={{ paddingTop: 60 }}>
              <Icon name="folder-open-outline" size={40} className="text-muted-foreground" />
              <Text muted className="text-center px-8" style={{ marginTop: 12 }}>
                {activeTab === 'mine' ? 'Todavía no tienes recursos asignados.' : 'Aún no hay recursos compartidos.'}
              </Text>
            </Box>
          ) : (
            <Box className="gap-2">
              {sections.map((section) =>
                section.data.length === 0 ? null : (
                  <Box key={section.label}>
                    <Text
                      weight="bold"
                      size="xs"
                      muted
                      className="uppercase"
                      style={{ letterSpacing: 0.4, marginBottom: 10, marginTop: 4 }}
                    >
                      {section.label}
                    </Text>
                    <Box className="gap-2.5">
                      {section.data.map((item) => (
                        <Pressable
                          key={item.id}
                          className="flex-row items-center gap-3 bg-card rounded-lg p-3.5"
                          onPress={() => openResource(item)}
                        >
                          <Box
                            className="w-11 h-11 rounded-md items-center justify-center"
                            style={{ backgroundColor: `${TYPE_COLOR[item.type] ?? C.textPrimary}1A` }}
                          >
                            <Icon
                              name={TYPE_ICON[item.type] ?? 'document-text-outline'}
                              size={20}
                              color={TYPE_COLOR[item.type] ?? C.textPrimary}
                            />
                          </Box>
                          <Box className="flex-1">
                            <Text weight="bold" size="sm" numberOfLines={2}>
                              {item.title}
                            </Text>
                            <Text muted size="xs" className="capitalize" style={{ marginTop: 3 }}>
                              {item.type}
                            </Text>
                          </Box>
                          <Icon name="chevron-forward" size={18} className="text-muted-foreground" />
                        </Pressable>
                      ))}
                    </Box>
                  </Box>
                )
              )}
            </Box>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
