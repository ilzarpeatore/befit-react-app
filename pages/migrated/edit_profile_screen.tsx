import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, ScrollView, Dimensions, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Image } from 'expo-image';
import { Box } from '@components/ui/box';
import { Text } from '@components/ui/text';
import { Pressable } from '@components/ui/pressable';
import { Icon } from '@components/ui/icon';
import { Spinner } from '@components/ui/spinner';
import { HStack } from '@components/ui/hstack';
import { VStack } from '@components/ui/vstack';
import { Button, ButtonText } from '@components/ui/button';
import { Input, InputField } from '@components/ui/input';
import { useAuth } from '@store/AuthContext';
import { authApi } from '@api/auth';
import { C, FONT } from './theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface EditProfileScreenProps {
  navigation: any;
}

function getGender() {
  const genderList = [
    { id: 0, label: 'Hombre', key: 'male' },
    { id: 1, label: 'Mujer', key: 'female' },
  ];
  return genderList;
}

 
async function pickImage() {
  // ImagePicker logic
  // const result = await ImagePicker.launchImageLibraryAsync({...});
  // if (!result.canceled) setImageUri(result.assets[0].uri);
}

export default function EditProfileScreen(props: EditProfileScreenProps) {

  const { updateUser, state } = useAuth();
  const [fName, setFName] = useState('');
  const [lName, setLName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [weight, setWeight] = useState('');
  const [heightVal, setHeightVal] = useState('');
  const genderRef = useRef('female');
  const [selectGender, setSelectGender] = useState(0);
  const [profileImage, setProfileImage] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mHeight, setMHeight] = useState<number | undefined>(undefined);
  const [mWeight, setMWeight] = useState<number | undefined>(undefined);
  const [weightType, setWeightType] = useState('kg');

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    if (state.user) {
      setFName(state.user.first_name ?? '');
      setLName(state.user.last_name ?? '');
      setEmail(state.user.email ?? '');
      setPhoneNumber(state.user.phone_number ?? '');
      genderRef.current = state.user.gender || 'female';
      setProfileImage(state.user.profile_image ?? '');
      setSelectGender(state.user.gender === 'male' ? 0 : 1);
    }
  };

  const convertFeetToCm = () => {
    const val = parseFloat(heightVal) || 0;
    const cm = val * 30.48;
    if (heightVal) setHeightVal(cm.toFixed(2));
  };

  const convertCMToFeet = () => {
    const val = parseFloat(heightVal) || 0;
    const feet = val * 0.0328;
    if (heightVal) setHeightVal(feet.toFixed(2));
  };

  const convertLbsToKg = () => {
    const val = parseFloat(weight) || 0;
    const kg = val * 0.45359237;
    if (weight) setWeight(kg.toFixed(2));
  };

  const convertKgToLbs = () => {
    const val = parseFloat(weight) || 0;
    const lbs = val * 2.2046;
    if (weight) setWeight(lbs.toFixed(2));
  };

  const save = async () => {
    setIsLoading(true);
    try {
      // Dos bugs reales corregidos aquí:
      // 1) UserRequest::rules() exige 'username' siempre en rutas api/* —
      //    como este payload nunca lo mandaba, TODO guardado desde Edit
      //    Profile fallaba con 422 "username field is required" (no solo
      //    age/weight/height, ningún campo se llegaba a guardar nunca).
      // 2) UserController::updateProfile solo escribe en user_profiles
      //    cuando el payload trae la clave anidada "user_profile" —
      //    age/weight/height sueltos en el nivel superior se descartan en
      //    silencio porque no son fillable en el modelo User.
      const payload: Record<string, any> = {
        first_name: fName.trim(),
        last_name: lName.trim(),
        email: email.trim(),
        username: state.user?.username,
        phone_number: phoneNumber.trim(),
        gender: genderRef.current,
        user_profile: {
          age: age.trim(),
          weight: weight.trim(),
          height: heightVal.trim(),
        },
      };
      if (imageUri) {
        payload.profile_image = imageUri;
      }
      const response = await authApi.updateProfile(payload);
      if (state.user) {
        updateUser({
          ...state.user,
          ...payload,
          user_profile: { ...state.user.user_profile, ...payload.user_profile },
        });
      }
      props.navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'No se pudo guardar');
    } finally {
      setIsLoading(false);
    }
  };

  const genderList = getGender();

  const renderProfileImage = () => {
    if (imageUri) {
      return (
        <Box style={localStyles.profileImageContainer}>
          <Image source={{ uri: imageUri }} contentFit="cover" style={localStyles.profileImage} />
        </Box>
      );
    }
    if (profileImage) {
      return (
        <Box style={localStyles.profileImageContainer}>
          <Image source={{ uri: profileImage }} contentFit="cover" style={localStyles.profileImage} />
        </Box>
      );
    }
    return (
      <Box style={localStyles.profileImageContainer}>
        <Box style={localStyles.profileImagePlaceholder}>
          <Icon name="person" size={40} color={C.gray40} />
        </Box>
      </Box>
    );
  };

  const renderHeightOption = (label: string, index: number) => {
    const isActive = mHeight === index;
    return (
      <Button
        variant="outline"
        style={[localStyles.unitBtn, isActive && localStyles.unitBtnActive] as any}
        onPress={() => {
          setMHeight(index);
          if (index === 1) {
            convertFeetToCm();
          } else {
            convertCMToFeet();
          }
        }}
      >
        <ButtonText style={[localStyles.unitBtnText, isActive && localStyles.unitBtnTextActive] as any}>
          {label}
        </ButtonText>
      </Button>
    );
  };

  const renderWeightOption = (label: string, index: number) => {
    const isActive = mWeight === index;
    return (
      <Button
        variant="outline"
        style={[localStyles.unitBtn, isActive && localStyles.unitBtnActive] as any}
        onPress={() => {
          setMWeight(index);
          if (index === 0) {
            convertKgToLbs();
          } else {
            convertLbsToKg();
          }
        }}
      >
        <ButtonText style={[localStyles.unitBtnText, isActive && localStyles.unitBtnTextActive] as any}>
          {label}
        </ButtonText>
      </Button>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Box style={localStyles.container}>
        {/* Header Background */}
        <Box style={localStyles.headerBg} />

        {/* Back Button */}
        <Pressable style={localStyles.backBtn} onPress={() => props.navigation.goBack()}>
          <Icon name="chevron-back" size={24} color={C.white} />
        </Pressable>

        <ScrollView contentContainerStyle={localStyles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Profile Image */}
          <Box style={localStyles.imageSection}>
            {renderProfileImage()}
            <Pressable style={localStyles.cameraBtn} onPress={pickImage}>
              <Icon name="camera" size={20} color={C.textPrimary} />
            </Pressable>
          </Box>

          {/* Form Fields */}
          <Box style={localStyles.formContainer}>
            {/* First Name */}
            <VStack className="gap-1.5" style={localStyles.fieldGroup}>
              <Text style={localStyles.label}>Nombre</Text>
              <Input style={{ borderRadius: 8 }}>
                <InputField
                  className="text-sm px-3.5"
                  style={{ color: C.white }}
                  value={fName}
                  onChangeText={setFName}
                  placeholder="Nombre"
                  placeholderTextColor={C.gray40}
                />
              </Input>
            </VStack>

            {/* Last Name */}
            <VStack className="gap-1.5" style={localStyles.fieldGroup}>
              <Text style={localStyles.label}>Apellidos</Text>
              <Input style={{ borderRadius: 8 }}>
                <InputField
                  className="text-sm px-3.5"
                  style={{ color: C.white }}
                  value={lName}
                  onChangeText={setLName}
                  placeholder="Apellidos"
                  placeholderTextColor={C.gray40}
                />
              </Input>
            </VStack>

            {/* Email */}
            <VStack className="gap-1.5" style={localStyles.fieldGroup}>
              <Text style={localStyles.label}>Email</Text>
              <Input style={{ borderRadius: 8 }}>
                <InputField
                  className="text-sm px-3.5"
                  style={{ color: C.white }}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Email"
                  placeholderTextColor={C.gray40}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </Input>
            </VStack>

            {/* Gender */}
            <VStack className="gap-1.5" style={localStyles.fieldGroup}>
              <Text style={localStyles.label}>Género</Text>
              <HStack className="gap-2.5">
                {genderList.map((g) => (
                  <Button
                    key={g.id}
                    variant="outline"
                    style={[localStyles.genderBtn, selectGender === g.id && localStyles.genderBtnActive] as any}
                    onPress={() => {
                      setSelectGender(g.id);
                      genderRef.current = g.key;
                    }}
                  >
                    <ButtonText style={[localStyles.genderText, selectGender === g.id && localStyles.genderTextActive] as any}>
                      {g.label}
                    </ButtonText>
                  </Button>
                ))}
              </HStack>
            </VStack>

            {/* Phone Number */}
            <VStack className="gap-1.5" style={localStyles.fieldGroup}>
              <Text style={localStyles.label}>Número de teléfono</Text>
              <Input style={{ borderRadius: 8 }}>
                <InputField
                  className="text-sm px-3.5"
                  style={{ color: C.white }}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  placeholder="Número de teléfono"
                  placeholderTextColor={C.gray40}
                  keyboardType="phone-pad"
                />
              </Input>
            </VStack>

            {/* Age */}
            <VStack className="gap-1.5" style={localStyles.fieldGroup}>
              <Text style={localStyles.label}>Edad</Text>
              <Input style={{ borderRadius: 8 }}>
                <InputField
                  className="text-sm px-3.5"
                  style={{ color: C.white }}
                  value={age}
                  onChangeText={setAge}
                  placeholder="Edad"
                  placeholderTextColor={C.gray40}
                  keyboardType="number-pad"
                />
              </Input>
            </VStack>

            {/* Weight */}
            <VStack className="gap-1.5" style={localStyles.fieldGroup}>
              <Text style={localStyles.label}>Peso</Text>
              <Input style={{ borderRadius: 8 }}>
                <InputField
                  className="text-sm px-3.5"
                  style={{ color: C.white }}
                  value={weight}
                  onChangeText={setWeight}
                  placeholder="Peso"
                  placeholderTextColor={C.gray40}
                  keyboardType="decimal-pad"
                />
              </Input>
              <HStack space="sm" style={{ marginTop: 8 }}>
                {renderWeightOption('lbs', 0)}
                {renderWeightOption('kg', 1)}
              </HStack>
            </VStack>

            {/* Height */}
            <VStack className="gap-1.5" style={localStyles.fieldGroup}>
              <Text style={localStyles.label}>Altura</Text>
              <Input style={{ borderRadius: 8 }}>
                <InputField
                  className="text-sm px-3.5"
                  style={{ color: C.white }}
                  value={heightVal}
                  onChangeText={setHeightVal}
                  placeholder="Altura"
                  placeholderTextColor={C.gray40}
                  keyboardType="decimal-pad"
                />
              </Input>
              <HStack space="sm" style={{ marginTop: 8 }}>
                {renderHeightOption('feet', 0)}
                {renderHeightOption('cm', 1)}
              </HStack>
            </VStack>

            {/* Save Button */}
            <Button
              style={localStyles.saveBtn}
              onPress={save}
              disabled={isLoading}
            >
              {isLoading ? (
                <Spinner color={C.white} />
              ) : (
                <ButtonText style={localStyles.saveBtnText}>Guardar</ButtonText>
              )}
            </Button>
          </Box>
        </ScrollView>

        {isLoading && (
          <Box style={localStyles.loaderContainer}>
            <Spinner size="large" color={C.orange} />
          </Box>
        )}
      </Box>
    </KeyboardAvoidingView>
  );
}

const localStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  headerBg: {
    height: SCREEN_HEIGHT * 0.3,
    backgroundColor: C.brand5,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  backBtn: {
    position: 'absolute',
    top: 50,
    left: 8,
    padding: 8,
    zIndex: 10,
  },
  scrollContent: {
    paddingTop: SCREEN_HEIGHT * 0.15 + 16,
    paddingBottom: 40,
  },
  imageSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  profileImageContainer: {
    padding: 2,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: C.brand60,
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: C.gray70,
  },
  profileImagePlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: C.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraBtn: {
    position: 'absolute',
    bottom: -5,
    right: SCREEN_WIDTH / 2 - 60,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.brand20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    backgroundColor: C.bg,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  fieldGroup: {
    marginBottom: 18,
  },
  label: {
    fontFamily: FONT.medium,
    fontSize: 13,
    color: C.gray30,
    marginBottom: 6,
  },
  genderBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    backgroundColor: C.surfaceLight,
    alignItems: 'center',
  },
  genderBtnActive: {
    backgroundColor: C.brand5,
  },
  genderText: {
    fontFamily: FONT.regular,
    fontSize: 14,
    color: C.gray30,
  },
  genderTextActive: {
    color: C.white,
  },
  unitBtn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: C.surfaceLight,
  },
  unitBtnActive: {
    backgroundColor: C.brand5,
  },
  unitBtnText: {
    fontFamily: FONT.regular,
    fontSize: 13,
    color: C.gray30,
  },
  unitBtnTextActive: {
    color: C.white,
  },
  saveBtn: {
    backgroundColor: C.brand5,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  saveBtnText: {
    fontFamily: FONT.bold,
    fontSize: 16,
    color: C.white,
  },
  loaderContainer: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
