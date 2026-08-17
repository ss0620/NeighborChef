import { router, useLocalSearchParams } from 'expo-router';

import { ListingForm } from '@/components/marketplace/listing-form';
import { Screen, ScreenLoading } from '@/components/ui/screen';
import { useListing, useUpdateListing } from '@/lib/hooks/useListings';

export default function EditListingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: listing, isLoading } = useListing(id);
  const updateListing = useUpdateListing(id);

  if (isLoading || !listing) return <ScreenLoading />;

  return (
    <Screen>
      <ListingForm
        initialListing={listing}
        submitLabel="Save Changes"
        submitting={updateListing.isPending}
        onSubmit={async (input) => {
          await updateListing.mutateAsync(input);
          router.replace('/(tabs)/marketplace/my-listings');
        }}
      />
    </Screen>
  );
}
