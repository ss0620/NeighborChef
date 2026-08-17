import { router } from 'expo-router';

import { ListingForm } from '@/components/marketplace/listing-form';
import { Screen } from '@/components/ui/screen';
import { useCreateListing } from '@/lib/hooks/useListings';

export default function NewListingScreen() {
  const createListing = useCreateListing();

  return (
    <Screen>
      <ListingForm
        submitLabel="Publish Listing"
        submitting={createListing.isPending}
        onSubmit={async (input) => {
          const listing = await createListing.mutateAsync(input);
          router.replace(`/(tabs)/marketplace/my-listings/${listing.id}/edit`);
        }}
      />
    </Screen>
  );
}
