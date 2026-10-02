import { useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import { Image } from 'expo-image';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { blink } from '@/lib/blink';
import type { OrnamentsRow } from '@/lib/db-types';
import {
  Button,
  H1,
  Input,
  ScrollView,
  SizableText,
  Spinner,
  XStack,
  YStack,
} from '@blinkdotnew/mobile-ui';

const C = {
  paper: '#F8F5ED',
  card: '#FFFEFA',
  ink: '#26382D',
  pine: '#244735',
  green: '#627C62',
  gold: '#C79B52',
  blush: '#A84E45',
  line: '#E9E1D2',
  muted: '#817F72',
};
const TREE = 'https://storage.googleapis.com/blink-core-storage/projects/esfera-catalog-app-t5fepzp0/ai-images/1790910240974-7e1fd7a7-8a6c-4fd5-96fc-a9b3f0fbb227.webp';
const WREATH = 'https://storage.googleapis.com/blink-core-storage/projects/esfera-catalog-app-t5fepzp0/ai-images/1790910270120-9350eb9c-690d-4a57-93ef-b7473ae177cb.webp';
const fallbackProducts: OrnamentsRow[] = [
  { id: 'esfera-aurora', name: 'Aurora de cristal', category: 'Vidrio soplado', price: 185, imageUrl: TREE, color: 'champagne', description: 'Cristal facetado y destellos cálidos.', featured: true, createdAt: '' },
  { id: 'esfera-nochebuena', name: 'Nochebuena', category: 'Vidrio pintado', price: 145, imageUrl: 'https://images.unsplash.com/photo-1545608444-f045a6db6133?w=800&q=85', color: 'cranberry', description: 'Rojo profundo, brillante y festivo.', featured: true, createdAt: '' },
  { id: 'esfera-bosque', name: 'Bosque aterciopelado', category: 'Acabado mate', price: 120, imageUrl: 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=800&q=85', color: 'forest', description: 'Verde pino mate de textura suave.', featured: false, createdAt: '' },
  { id: 'esfera-estrella', name: 'Estrella dorada', category: 'Metalizada', price: 165, imageUrl: 'https://images.unsplash.com/photo-1482517967863-00e15c9b44be?w=800&q=85', color: 'gold', description: 'Brillo sutil y reflejos de oro.', featured: true, createdAt: '' },
  { id: 'esfera-nieve', name: 'Nieve de invierno', category: 'Escarchada', price: 135, imageUrl: 'https://images.unsplash.com/photo-1513297887119-d46091b24bfa?w=800&q=85', color: 'ivory', description: 'Marfil con destellos como nieve.', featured: false, createdAt: '' },
  { id: 'esfera-campana', name: 'Campanita clásica', category: 'Vidrio soplado', price: 155, imageUrl: 'https://images.unsplash.com/photo-1512909006721-3d6018887383?w=800&q=85', color: 'gold', description: 'Un detalle dorado de aire nostálgico.', featured: false, createdAt: '' },
  { id: 'esfera-arandano', name: 'Arándano brillante', category: 'Vidrio pintado', price: 110, imageUrl: 'https://images.unsplash.com/photo-1544273677-c433136021d4?w=800&q=85', color: 'cranberry', description: 'Color arándano clásico y luminoso.', featured: false, createdAt: '' },
  { id: 'esfera-luna', name: 'Luna de invierno', category: 'Acabado perlado', price: 175, imageUrl: 'https://images.unsplash.com/photo-1543589077-47d81606c1bf?w=800&q=85', color: 'ivory', description: 'Perlado suave que cambia con la luz.', featured: true, createdAt: '' },
  { id: 'esfera-olivo', name: 'Olivo antiguo', category: 'Acabado mate', price: 125, imageUrl: 'https://images.unsplash.com/photo-1513278974582-3e1b4a4fa21d?w=800&q=85', color: 'forest', description: 'Verde oliva para composiciones naturales.', featured: false, createdAt: '' },
  { id: 'esfera-caramelo', name: 'Caramelo dorado', category: 'Vidrio soplado', price: 150, imageUrl: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&q=85', color: 'gold', description: 'Dorado cálido, como luz de vela.', featured: false, createdAt: '' },
];
const money = (value: number | string) => `$${Number(value).toLocaleString('es-MX')} MXN`;

export default function Home() {
  const [scene, setScene] = useState<'Árbol' | 'Rosca'>('Árbol');
  const [picked, setPicked] = useState<string[]>(['esfera-aurora', 'esfera-nochebuena', 'esfera-bosque']);
  const [category, setCategory] = useState('Todo');
  const [user, setUser] = useState<any>(null);
  const [showAccount, setShowAccount] = useState(false);
  const [createAccount, setCreateAccount] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const queryClient = useQueryClient();
  const catalogQuery = useQuery({
    queryKey: ['ornaments'],
    queryFn: () => blink.db.table<OrnamentsRow>('ornaments').list({ orderBy: { createdAt: 'desc' } }),
  });
  const products = catalogQuery.data?.length ? catalogQuery.data : fallbackProducts;
  const categories = ['Todo', ...Array.from(new Set(products.map((item) => item.category)))];
  const visibleProducts = category === 'Todo' ? products : products.filter((item) => item.category === category);
  const selectedProducts = useMemo(() => products.filter((item) => picked.includes(item.id)), [products, picked]);
  const total = selectedProducts.reduce((sum, item) => sum + Number(item.price), 0);

  useEffect(() => {
    return blink.auth.onAuthStateChanged((state) => {
      setUser(state.user);
    });
  }, []);

  const togglePicked = (id: string) => {
    setPicked((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  const scrollTo = (id: string) => {
    if (Platform.OS === 'web') {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const reserve = async (customerId: string, customerEmail: string) => {
    await blink.db.table('reservations').create({
      id: `apartado_${Date.now()}`,
      userId: customerId,
      customerName: customerEmail.split('@')[0],
      contact: customerEmail,
      scene: scene === 'Árbol' ? 'arbol' : 'rosca',
      ornamentIds: JSON.stringify(picked),
      total,
      status: 'apartado',
    });
    setShowAccount(false);
    setNotice('¡Tu set quedó apartado! Pronto nos pondremos en contacto contigo.');
    setPicked([]);
    await queryClient.invalidateQueries({ queryKey: ['reservations', customerId] });
  };

  const handleReserve = async () => {
    setNotice('');
    if (!picked.length) {
      setNotice('Agrega al menos una esfera para apartar tu set.');
      return;
    }
    if (user?.id) {
      setBusy(true);
      try {
        await reserve(user.id, user.email || '');
      } catch (error) {
        setNotice(error instanceof Error ? error.message : 'No pudimos guardar tu apartado. Intenta de nuevo.');
      } finally {
        setBusy(false);
      }
    } else {
      setShowAccount(true);
    }
  };

  const handleAccount = async () => {
    setBusy(true);
    setNotice('');
    try {
      if (createAccount) {
        await blink.auth.signUp({ email, password, metadata: { displayName: email.split('@')[0] } });
      } else {
        await blink.auth.signInWithEmail(email, password);
      }
      const signedIn = await blink.auth.me();
      await reserve(signedIn.id, signedIn.email || email);
      setUser(signedIn);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'No pudimos iniciar sesión. Revisa tus datos e intenta de nuevo.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <YStack flex={1} backgroundColor={C.paper}>
      <ScrollView flex={1} showsVerticalScrollIndicator={false}>
        <YStack width="100%" maxWidth={760} alignSelf="center" paddingHorizontal="$4" paddingTop="$4" paddingBottom="$8" gap="$5">
          <XStack alignItems="center" justifyContent="space-between" paddingVertical="$2">
            <YStack>
              <SizableText color={C.green} size="$2" letterSpacing={2} fontWeight="700">TEMPORADA 2026</SizableText>
              <SizableText color={C.pine} size="$6" fontWeight="800">esfera</SizableText>
            </YStack>
            <Button onPress={() => {
              if (user) void blink.auth.signOut();
              else {
                setShowAccount(true);
                scrollTo('apartado');
              }
            }} backgroundColor={C.card} borderColor={C.line} borderWidth={1} borderRadius="$10" minHeight={46} paddingHorizontal="$4">
              <SizableText color={C.pine} size="$3" fontWeight="600">{user ? 'Mi cuenta · Salir' : 'Iniciar sesión'}</SizableText>
            </Button>
          </XStack>

          <YStack borderRadius="$6" overflow="hidden" height={300} backgroundColor={C.pine}>
            <Image source={{ uri: TREE }} contentFit="cover" style={{ width: '100%', height: '100%', position: 'absolute' }} />
            <YStack flex={1} justifyContent="flex-end" padding="$5" backgroundColor="rgba(20,34,25,0.28)" gap="$3">
              <SizableText color="#F4DBA6" size="$2" letterSpacing={2} fontWeight="700">HECHAS PARA TU NAVIDAD</SizableText>
              <H1 color="#FFFDF6" fontSize={34} lineHeight={39} fontWeight="700" maxWidth={340}>Un árbol que se sienta muy tuyo.</H1>
              <SizableText color="#FFFDF6" size="$3" maxWidth={330} lineHeight={22}>Combina tus favoritas y míralas antes de elegir.</SizableText>
              <Button onPress={() => scrollTo('catalogo')} backgroundColor={C.gold} borderRadius="$4" height={48} width={170} marginTop="$1">
                <SizableText color={C.pine} size="$3" fontWeight="700">Arma tu set ↓</SizableText>
              </Button>
            </YStack>
          </YStack>

          <YStack id="catalogo" gap="$3">
            <XStack alignItems="flex-end" justifyContent="space-between">
              <YStack gap="$1">
                <SizableText color={C.gold} size="$2" fontWeight="700" letterSpacing={1.5}>LA COLECCIÓN</SizableText>
                <SizableText color={C.ink} size="$6" fontWeight="700">Encuentra tus favoritas</SizableText>
              </YStack>
              <SizableText color={C.muted} size="$2">{products.length} diseños</SizableText>
            </XStack>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
              {categories.map((item) => (
                <Button key={item} onPress={() => setCategory(item)} backgroundColor={category === item ? C.pine : C.card} borderColor={category === item ? C.pine : C.line} borderWidth={1} borderRadius="$10" minHeight={42} paddingHorizontal="$4">
                  <SizableText color={category === item ? '#FFFDF6' : C.ink} size="$2" fontWeight="600">{item}</SizableText>
                </Button>
              ))}
            </ScrollView>
            {catalogQuery.isLoading && <XStack justifyContent="center" padding="$5"><Spinner color={C.gold} size="large" /></XStack>}
            {catalogQuery.isError && <SizableText color={C.blush}>No pudimos actualizar el catálogo. Mostramos una selección para que puedas seguir.</SizableText>}
            <XStack flexWrap="wrap" justifyContent="space-between" gap="$3">
              {visibleProducts.map((item, index) => {
                const active = picked.includes(item.id);
                return (
                  <Button key={item.id} unstyled onPress={() => togglePicked(item.id)} width="48%" minHeight={235} backgroundColor={C.card} borderRadius="$5" overflow="hidden" borderWidth={active ? 2 : 1} borderColor={active ? C.gold : C.line} pressStyle={{ scale: 0.97, opacity: 0.92 }} animation="quick">
                    <YStack flex={1}>
                      <YStack height={143} backgroundColor="#E8E2D6" position="relative">
                        <Image source={{ uri: item.imageUrl }} contentFit="cover" style={{ width: '100%', height: '100%' }} />
                        {active && <YStack position="absolute" right={10} top={10} width={26} height={26} borderRadius={13} backgroundColor={C.pine} alignItems="center" justifyContent="center"><SizableText color="white" size="$2" fontWeight="800">✓</SizableText></YStack>}
                      </YStack>
                      <YStack padding="$3" gap="$1" flex={1}>
                        <SizableText color={C.muted} size="$1" fontWeight="600">{item.category}</SizableText>
                        <SizableText color={C.ink} size="$3" fontWeight="700" numberOfLines={1}>{item.name}</SizableText>
                        <SizableText color={C.pine} size="$3" fontWeight="800">{money(item.price)}</SizableText>
                      </YStack>
                    </YStack>
                  </Button>
                );
              })}
            </XStack>
          </YStack>

          <YStack id="apartado" gap="$3" paddingTop="$2">
            <YStack gap="$1">
              <SizableText color={C.gold} size="$2" fontWeight="700" letterSpacing={1.5}>ASÍ SE VERÍA</SizableText>
              <SizableText color={C.ink} size="$6" fontWeight="700">Prueba tu combinación</SizableText>
            </YStack>
            <XStack backgroundColor="#EAE4D8" borderRadius="$10" padding="$1" gap="$1">
              {(['Árbol', 'Rosca'] as const).map((option) => (
                <Button key={option} flex={1} onPress={() => setScene(option)} backgroundColor={scene === option ? C.card : 'transparent'} borderRadius="$10" height={44}>
                  <SizableText color={scene === option ? C.pine : C.muted} size="$3" fontWeight="700">{option === 'Árbol' ? '✦  Árbol' : '❋  Rosca'}</SizableText>
                </Button>
              ))}
            </XStack>
            <YStack height={320} overflow="hidden" borderRadius="$6" backgroundColor={C.pine} position="relative">
              <Image source={{ uri: scene === 'Árbol' ? TREE : WREATH }} contentFit="cover" style={{ width: '100%', height: '100%', position: 'absolute' }} />
              <YStack flex={1} justifyContent="space-between" padding="$4" backgroundColor="rgba(22,33,25,0.12)">
                <XStack justifyContent="space-between" alignItems="center">
                  <SizableText color="white" size="$2" fontWeight="700" letterSpacing={1.2}>{scene === 'Árbol' ? 'EN TU ÁRBOL' : 'EN TU PUERTA'}</SizableText>
                  <YStack backgroundColor="rgba(255,253,246,0.92)" paddingHorizontal="$3" paddingVertical="$2" borderRadius="$10"><SizableText color={C.pine} size="$2" fontWeight="700">{picked.length} elegidas</SizableText></YStack>
                </XStack>
                <XStack flexWrap="wrap" gap="$2" justifyContent="center">
                  {selectedProducts.slice(0, 6).map((item) => (
                    <YStack key={item.id} width={38} height={38} borderRadius={19} borderWidth={2} borderColor="#F5DDAA" backgroundColor={item.color === 'cranberry' ? '#A64239' : item.color === 'forest' ? '#315C3E' : item.color === 'ivory' ? '#F3EAD6' : '#C79B52'} alignItems="center" justifyContent="center" shadowColor="#17271D" shadowRadius={5} shadowOpacity={0.55}>
                      <SizableText color="rgba(255,255,255,0.88)" size="$1">✦</SizableText>
                    </YStack>
                  ))}
                  {!picked.length && <SizableText color="white" size="$3">Elige esferas del catálogo para empezar</SizableText>}
                </XStack>
              </YStack>
            </YStack>
            <XStack justifyContent="space-between" alignItems="center" paddingHorizontal="$1">
              <SizableText color={C.muted} size="$3">{picked.length} piezas en tu combinación</SizableText>
              <SizableText color={C.pine} size="$4" fontWeight="800">{money(total)}</SizableText>
            </XStack>
            <Button onPress={handleReserve} disabled={busy} backgroundColor={C.pine} borderRadius="$4" height={54} pressStyle={{ scale: 0.98, opacity: 0.88 }}>
              <SizableText color="#FFFDF6" size="$4" fontWeight="700">{busy ? 'Guardando…' : 'Apartar mi set'}</SizableText>
            </Button>
            <SizableText color={C.muted} size="$2" textAlign="center">Sin pago ahora · Confirmamos disponibilidad contigo</SizableText>
          </YStack>

          {showAccount && !user && (
            <YStack backgroundColor={C.card} padding="$4" borderRadius="$5" borderWidth={1} borderColor={C.line} gap="$3">
              <YStack gap="$1">
                <SizableText color={C.ink} size="$5" fontWeight="700">{createAccount ? 'Crea tu cuenta para apartar' : 'Qué gusto verte de nuevo'}</SizableText>
                <SizableText color={C.muted} size="$3">Guardaremos tu selección y nos pondremos en contacto.</SizableText>
              </YStack>
              <Input value={email} onChangeText={setEmail} placeholder="Correo electrónico" keyboardType="email-address" autoCapitalize="none" height={50} backgroundColor={C.paper} borderColor={C.line} />
              <Input value={password} onChangeText={setPassword} placeholder="Contraseña" secureTextEntry height={50} backgroundColor={C.paper} borderColor={C.line} />
              <Button onPress={handleAccount} disabled={busy || !email || !password} backgroundColor={C.pine} borderRadius="$4" height={50}>
                <SizableText color="white" size="$3" fontWeight="700">{busy ? 'Un momento…' : createAccount ? 'Crear cuenta y apartar' : 'Entrar y apartar'}</SizableText>
              </Button>
              <Button onPress={() => setCreateAccount(!createAccount)} chromeless minHeight={44}>
                <SizableText color={C.green} size="$2">{createAccount ? 'Ya tengo cuenta · Iniciar sesión' : 'Soy nuevo · Crear cuenta'}</SizableText>
              </Button>
            </YStack>
          )}
          {!!notice && <YStack backgroundColor={notice.startsWith('¡') ? '#E7EFE4' : '#F6E9E2'} padding="$3" borderRadius="$4"><SizableText color={notice.startsWith('¡') ? C.pine : C.blush} size="$3">{notice}</SizableText></YStack>}
          <XStack justifyContent="center" paddingTop="$2"><SizableText color={C.muted} size="$2">Pequeños detalles, grandes recuerdos · Hecho con cariño</SizableText></XStack>
        </YStack>
      </ScrollView>
    </YStack>
  );
}
