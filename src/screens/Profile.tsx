import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Observer } from "mobx-react";
import { useNostr, useNostrEvents, useProfile } from "nostr-react";
import { getEventHash, getPublicKey, Kind, signEvent } from "nostr-tools";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, ToastAndroid, View } from "react-native";
import { Avatar, Button, Text } from "react-native-paper";
import Input from "../components/Input";
import { RootStackParamList } from "../navigation";
import { useStores } from "../store";

type ProfileScreenProps = NativeStackScreenProps<RootStackParamList, "Profile">;

type ProfileScreenState = {
  name: string | undefined;
  about: string | undefined;
  picture: string | undefined;
};

const ProfileScreen = ({ route, navigation }: ProfileScreenProps) => {
  const [state, setState] = useState<ProfileScreenState>({
    name: undefined,
    about: undefined,
    picture: undefined,
  });
  const { userStore } = useStores();
  const { publish } = useNostr();
  const { data: userData } = useProfile({
    pubkey: getPublicKey(userStore.key),
  });

  const { onEvent } = useNostrEvents({
    filter: { authors: [getPublicKey(userStore.key)] },
  });

  onEvent((event) => {
    ToastAndroid.show("Profile actualized", ToastAndroid.SHORT);
  });

  useEffect(() => {
    if (!userData) return;
    if (!state.name)
      setState((state) => ({
        name: userData.name,
        about: userData.about,
        picture: userData.picture,
      }));
  }, [userData]);

  const handleUpdate = () => {
    let event: any = {
      kind: Kind.Metadata,
      created_at: Math.floor(Date.now() / 1000),
      content: JSON.stringify(state),
      pubkey: getPublicKey(userStore.key),
      tags: [],
    };

    event.id = getEventHash(event);
    event.sig = signEvent(event, userStore.key);

    publish(event);
  };

  return (
    <Observer>
      {() => (
        <ScrollView style={styles.root}>
          <View style={styles.picture}>
            {state.picture && state.picture.length > 1 ? (
              <Avatar.Image
                size={100}
                source={{ uri: state.picture }}
                style={styles.avatar}
              />
            ) : (
              <Avatar.Icon
                size={100}
                icon="account-question"
                style={styles.avatar}
              />
            )}
          </View>
          <Text style={styles.title}>Display name:</Text>
          <Input
            value={state.name}
            placeholder="name to display"
            onChange={(e) => setState({ ...state, name: e.nativeEvent.text })}
          />
          <Text style={styles.title}>About you:</Text>
          <Input
            value={state.about}
            placeholder="A little description of yourself"
            onChange={(e) => setState({ ...state, about: e.nativeEvent.text })}
            numberOfLines={3}
            multiline
          />
          <Text style={styles.title}>Picture url:</Text>
          <Input
            value={state.picture}
            placeholder="https://"
            onChange={(e) =>
              setState({ ...state, picture: e.nativeEvent.text })
            }
          />
          <Text style={styles.title}>Private Key:</Text>
          <Input
            value={userStore.key}
            placeholder="private key"
            onChange={(e) => userStore.setKey(e.nativeEvent.text)}
            multiline
          />

          <View style={styles.buttonContainer}>
            <Button
              onPress={handleUpdate}
              style={styles.button}
              mode="contained"
              compact={false}
            >
              Update
            </Button>
          </View>
        </ScrollView>
      )}
    </Observer>
  );
};

const styles = StyleSheet.create({
  root: {
    padding: 15,
  },
  title: {
    marginTop: 15,
    marginBottom: 5,
    fontSize: 14,
    fontWeight: "bold",
  },
  picture: {
    alignItems: "center",
    marginTop: 5,
  },
  button: {
    marginTop: 5,
  },
  buttonContainer: {
    marginTop: 10,
    flexDirection: "row",
    alignSelf: "center",
  },
  avatar: { overflow: "hidden", borderWidth: 2 },
});

export default ProfileScreen;