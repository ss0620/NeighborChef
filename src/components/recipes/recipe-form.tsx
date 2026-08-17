import { zodResolver } from '@hookform/resolvers/zod';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { z } from 'zod';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/lib/auth/AuthProvider';
import type { RecipeInput, RecipeWithIngredients } from '@/lib/api/recipes';
import { uploadImage } from '@/lib/utils/uploadImage';

const recipeFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  servings: z.string().refine((v) => Number.isInteger(Number(v)) && Number(v) >= 1, 'Must be at least 1'),
  prepMinutes: z.string().optional(),
  cookMinutes: z.string().optional(),
  tags: z.string().optional(),
  ingredients: z
    .array(
      z.object({
        name: z.string().min(1, 'Required'),
        quantity: z.string().optional(),
        unit: z.string().optional(),
      })
    )
    .min(1, 'Add at least one ingredient'),
  steps: z.array(z.object({ text: z.string().min(1, 'Required') })).min(1, 'Add at least one step'),
});

type RecipeFormValues = z.infer<typeof recipeFormSchema>;

interface RecipeFormProps {
  initialRecipe?: RecipeWithIngredients;
  onSubmit: (input: RecipeInput) => Promise<void>;
  submitLabel: string;
  submitting: boolean;
}

export function RecipeForm({ initialRecipe, onSubmit, submitLabel, submitting }: RecipeFormProps) {
  const { session } = useAuth();
  const theme = useTheme();
  const [photoUrl, setPhotoUrl] = useState<string | null>(initialRecipe?.photo_url ?? null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RecipeFormValues>({
    resolver: zodResolver(recipeFormSchema),
    defaultValues: {
      title: initialRecipe?.title ?? '',
      description: initialRecipe?.description ?? '',
      servings: String(initialRecipe?.servings ?? 4),
      prepMinutes: initialRecipe?.prep_minutes != null ? String(initialRecipe.prep_minutes) : '',
      cookMinutes: initialRecipe?.cook_minutes != null ? String(initialRecipe.cook_minutes) : '',
      tags: initialRecipe?.tags?.join(', ') ?? '',
      ingredients: initialRecipe?.recipe_ingredients.length
        ? initialRecipe.recipe_ingredients.map((ingredient) => ({
            name: ingredient.name,
            quantity: ingredient.quantity != null ? String(ingredient.quantity) : '',
            unit: ingredient.unit ?? '',
          }))
        : [{ name: '', quantity: '', unit: '' }],
      steps: initialRecipe?.steps.length
        ? initialRecipe.steps.map((step) => ({ text: step.text }))
        : [{ text: '' }],
    },
  });

  const ingredientsArray = useFieldArray({ control, name: 'ingredients' });
  const stepsArray = useFieldArray({ control, name: 'steps' });

  async function pickPhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      allowsEditing: true,
      aspect: [4, 3],
    });
    if (result.canceled || !session) return;

    setUploadingPhoto(true);
    try {
      const url = await uploadImage('recipe-photos', session.user.id, result.assets[0].uri);
      setPhotoUrl(url);
    } finally {
      setUploadingPhoto(false);
    }
  }

  function submit(values: RecipeFormValues) {
    const input: RecipeInput = {
      title: values.title,
      description: values.description || null,
      photoUrl,
      servings: Number(values.servings),
      prepMinutes: values.prepMinutes ? Number(values.prepMinutes) : null,
      cookMinutes: values.cookMinutes ? Number(values.cookMinutes) : null,
      tags: values.tags ? values.tags.split(',').map((tag) => tag.trim()).filter(Boolean) : null,
      steps: values.steps.map((step, index) => ({ order: index, text: step.text })),
      ingredients: values.ingredients.map((ingredient) => ({
        name: ingredient.name,
        quantity: ingredient.quantity ? Number(ingredient.quantity) : null,
        unit: ingredient.unit || null,
      })),
    };
    return onSubmit(input);
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Pressable onPress={pickPhoto} style={[styles.photoPicker, { backgroundColor: theme.backgroundElement }]}>
        {photoUrl ? (
          <Image source={{ uri: photoUrl }} style={styles.photo} />
        ) : (
          <ThemedText themeColor="textSecondary">{uploadingPhoto ? 'Uploading…' : 'Add a photo'}</ThemedText>
        )}
      </Pressable>

      <Controller
        control={control}
        name="title"
        render={({ field }) => (
          <TextField label="Title" value={field.value} onChangeText={field.onChange} error={errors.title?.message} />
        )}
      />
      <Controller
        control={control}
        name="description"
        render={({ field }) => (
          <TextField label="Description" value={field.value} onChangeText={field.onChange} multiline numberOfLines={3} />
        )}
      />

      <View style={styles.row}>
        <Controller
          control={control}
          name="servings"
          render={({ field }) => (
            <View style={styles.rowItem}>
              <TextField
                label="Servings"
                value={String(field.value ?? '')}
                onChangeText={field.onChange}
                keyboardType="number-pad"
                error={errors.servings?.message}
              />
            </View>
          )}
        />
        <Controller
          control={control}
          name="prepMinutes"
          render={({ field }) => (
            <View style={styles.rowItem}>
              <TextField
                label="Prep (min)"
                value={field.value != null ? String(field.value) : ''}
                onChangeText={field.onChange}
                keyboardType="number-pad"
              />
            </View>
          )}
        />
        <Controller
          control={control}
          name="cookMinutes"
          render={({ field }) => (
            <View style={styles.rowItem}>
              <TextField
                label="Cook (min)"
                value={field.value != null ? String(field.value) : ''}
                onChangeText={field.onChange}
                keyboardType="number-pad"
              />
            </View>
          )}
        />
      </View>

      <Controller
        control={control}
        name="tags"
        render={({ field }) => (
          <TextField label="Tags (comma separated)" value={field.value} onChangeText={field.onChange} placeholder="quick, vegetarian" />
        )}
      />

      <View style={styles.sectionHeader}>
        <ThemedText type="smallBold">Ingredients</ThemedText>
        {errors.ingredients?.root ? (
          <ThemedText type="small" style={styles.error}>
            {errors.ingredients.root.message}
          </ThemedText>
        ) : null}
      </View>
      {ingredientsArray.fields.map((field, index) => (
        <View key={field.id} style={styles.dynamicRow}>
          <Controller
            control={control}
            name={`ingredients.${index}.quantity`}
            render={({ field: f }) => (
              <View style={styles.qtyField}>
                <TextField placeholder="Qty" value={f.value} onChangeText={f.onChange} keyboardType="decimal-pad" />
              </View>
            )}
          />
          <Controller
            control={control}
            name={`ingredients.${index}.unit`}
            render={({ field: f }) => (
              <View style={styles.unitField}>
                <TextField placeholder="Unit" value={f.value} onChangeText={f.onChange} />
              </View>
            )}
          />
          <Controller
            control={control}
            name={`ingredients.${index}.name`}
            render={({ field: f }) => (
              <View style={styles.nameField}>
                <TextField
                  placeholder="Ingredient"
                  value={f.value}
                  onChangeText={f.onChange}
                  error={errors.ingredients?.[index]?.name?.message}
                />
              </View>
            )}
          />
          <Pressable onPress={() => ingredientsArray.remove(index)} style={styles.removeButton}>
            <ThemedText style={styles.error}>✕</ThemedText>
          </Pressable>
        </View>
      ))}
      <Button
        title="+ Add ingredient"
        variant="secondary"
        onPress={() => ingredientsArray.append({ name: '', quantity: '', unit: '' })}
      />

      <View style={styles.sectionHeader}>
        <ThemedText type="smallBold">Steps</ThemedText>
      </View>
      {stepsArray.fields.map((field, index) => (
        <View key={field.id} style={styles.dynamicRow}>
          <ThemedText style={styles.stepNumber}>{index + 1}.</ThemedText>
          <Controller
            control={control}
            name={`steps.${index}.text`}
            render={({ field: f }) => (
              <View style={styles.nameField}>
                <TextField
                  placeholder={`Step ${index + 1}`}
                  value={f.value}
                  onChangeText={f.onChange}
                  multiline
                  error={errors.steps?.[index]?.text?.message}
                />
              </View>
            )}
          />
          <Pressable onPress={() => stepsArray.remove(index)} style={styles.removeButton}>
            <ThemedText style={styles.error}>✕</ThemedText>
          </Pressable>
        </View>
      ))}
      <Button title="+ Add step" variant="secondary" onPress={() => stepsArray.append({ text: '' })} />

      <View style={styles.submitButton}>
        <Button title={submitLabel} onPress={handleSubmit(submit)} loading={submitting} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 24,
    gap: 14,
  },
  photoPicker: {
    height: 160,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  rowItem: {
    flex: 1,
  },
  sectionHeader: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dynamicRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  qtyField: {
    width: 60,
  },
  unitField: {
    width: 70,
  },
  nameField: {
    flex: 1,
  },
  stepNumber: {
    marginTop: 14,
    width: 20,
  },
  removeButton: {
    paddingTop: 14,
    paddingHorizontal: 4,
  },
  error: {
    color: '#e5484d',
  },
  submitButton: {
    marginTop: 8,
  },
});
