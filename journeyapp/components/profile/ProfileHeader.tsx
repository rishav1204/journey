import { View, Image } from 'react-native';
import { Avatar } from '@/components/common/Avatar';
import { ThemedText } from '@/components/ui/ThemedText';
import { useUser } from '@/hooks/useUser';

export function ProfileHeader() {
  const { user } = useUser();

  return (
    <View style={styles.container}>
      <Avatar 
        size="large" 
        source={{ uri: user?.profilePicture }}
      />
      <ThemedText type="title">{user?.username}</ThemedText>
      <ThemedText>{user?.bio}</ThemedText>
      <View style={styles.stats}>
        <StatItem label="Followers" value={user?.followersCount} />
        <StatItem label="Following" value={user?.followingCount} />
      </View>
    </View>
  );
}