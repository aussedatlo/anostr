import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useMemo } from 'react';
import { StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import Avatar from '../../components/Avatar';
import { useDatabaseContext } from '../../context/DatabaseContext';
import { useUser } from '../../hooks/useUsers';
import { RootStackParamList } from '../../navigation';
import { Theme } from '../../providers/ThemeProvider';
import { Message } from '../../types/message';

type ContactMessageBoxProps = {
  pubkey: string;
};

const ContactMessageBox = ({ pubkey }: ContactMessageBoxProps) => {
  const theme = useTheme<Theme>();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const user = useUser(pubkey);
  const { allMessages } = useDatabaseContext();

  const messages = useMemo(
    () =>
      allMessages.filter(
        (m: Message) =>
          m.pubkey === pubkey || m.tags.toString().includes(pubkey),
      ),
    [allMessages, pubkey],
  );

  const { navigate } =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <TouchableWithoutFeedback
      onPress={() => navigate('Talk', { pubkey: pubkey })}
    >
      <View style={styles.root}>
        <Avatar pubkey={pubkey} picture={user?.picture} size={50} />
        <View style={styles.container}>
          <Text>{user?.name ? user.name : pubkey.slice(0, 8)}</Text>
          <Text
            variant="labelSmall"
            style={styles.secondary}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {messages?.[0]?.content}
          </Text>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const createStyles = ({ colors }: Theme) => {
  return StyleSheet.create({
    root: {
      flexDirection: 'row',
      margin: 10,
    },
    container: {
      flex: 1,
      marginLeft: 15,
      justifyContent: 'center',
    },
    secondary: {
      color: colors.tertiary,
    },
  });
};

export default ContactMessageBox;
