import { Event, Kind, nip04, SimplePool } from 'nostr-tools';
import React, { useCallback, useContext, useEffect, useRef } from 'react';
import { useMessages } from '../hooks/useMessages';
import { useUsers } from '../hooks/useUsers';
import { isReaction } from '../types/reaction';
import { User } from '../types/user';
import { useDatabaseContext } from './DatabaseContext';
import { useUserContext } from './UserContext';

type NostrContextProps = {
  pool: SimplePool;
};

const NostrContext = React.createContext<NostrContextProps | undefined>(
  undefined,
);

type NostrContextProviderProps = {
  children: React.ReactElement;
};

const NostrContextProvider = ({ children }: NostrContextProviderProps) => {
  const { relays, pubkey, key } = useUserContext();
  const { lastEvent } = useDatabaseContext();
  const { updateMessage, addMessage, addReaction, addOtherReaction } =
    useMessages();
  const { addUser, updateUserLastEventAt, updateUser } = useUsers();
  const pool = useRef(new SimplePool());

  const onOwnMessage = useCallback(
    async (event: Event) => {
      console.log(`own message detected ${event.id}`);
      await updateMessage({ ...event, pending: false, seen: true });
    },
    [updateMessage],
  );

  const onNewMessage = useCallback(
    async (event: Event) => {
      console.log(`new message detected ${event.id}`);
      await addMessage({
        ...event,
        pending: false,
        seen: false,
        content: await nip04.decrypt(key, event.pubkey, event.content),
      });

      await addUser({
        pubkey: event.pubkey,
      });
      await updateUserLastEventAt({
        pubkey: event.pubkey,
        lastEventAt: event.created_at,
      });
    },
    [addMessage, addUser, key, pubkey, updateUserLastEventAt],
  );

  const onReaction = useCallback(
    async (event: Event) => {
      console.log(`reaction detected ${event.id}`);
      const messageId = event.tags.find((tag) => tag[0] === 'e')?.[1];
      const reaction = event.content;

      if (!isReaction(reaction) || !messageId) return;

      if (event.pubkey === pubkey) await addReaction(messageId, reaction);
      else await addOtherReaction(messageId, reaction);
    },
    [addReaction, addOtherReaction, pubkey],
  );

  const onNewMetadata = useCallback(
    async (event: Event) => {
      try {
        let user = JSON.parse(event.content) as User;
        user.pubkey = event.pubkey;
        await updateUser(user);
      } catch {
        console.error('unable to parse metadata event');
      }
    },
    [updateUser],
  );

  const onEvent = useCallback(
    (event: Event) => {
      if (!key) return;

      switch (event.kind | (event.pubkey === pubkey ? 1 : 0)) {
        case Kind.EncryptedDirectMessage | 0:
          onNewMessage(event);
          break;
        case Kind.EncryptedDirectMessage | 1:
          onOwnMessage(event);
          break;
        case Kind.Reaction | 0:
        case Kind.Reaction | 1:
          onReaction(event);
          break;
        case Kind.Metadata | 0:
          onNewMetadata(event);
          break;
      }
    },
    [onNewMessage, onNewMetadata, onOwnMessage, onReaction, pubkey],
  );

  useEffect(() => {
    if (!relays || !lastEvent) return;

    const sub = pool.current.sub(relays, [
      {
        authors: [pubkey],
        kinds: [Kind.EncryptedDirectMessage, Kind.Metadata, Kind.Reaction],
        since: lastEvent + 1,
      },
      {
        '#p': [pubkey],
        kinds: [Kind.EncryptedDirectMessage, Kind.Reaction],
        since: lastEvent + 1,
      },
    ]);

    sub.on('event', onEvent);
  }, [relays, lastEvent]);

  return (
    <NostrContext.Provider value={{ pool: pool.current }}>
      {children}
    </NostrContext.Provider>
  );
};

export function useNostrContext() {
  const context = useContext(NostrContext);
  if (context === undefined) {
    throw new Error(
      'useNostrContext must be used within a NostrContextProvider',
    );
  }
  return context;
}

export default NostrContextProvider;
