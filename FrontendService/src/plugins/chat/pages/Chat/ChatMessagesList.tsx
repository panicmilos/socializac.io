import { AxiosError } from "axios";
import moment from "moment";
import { FC, useContext } from "react";
import { useMutation } from "react-query";
import { useUserFriendNamesMap, useUserFriendsMap } from "../../hooks";
import { AuthContext, DropdownItem, DropdownMenu, extractErrorMessage, useNotificationService } from "../../imports";
import { Message } from "../../models/Message";
import { useChatService } from "../../services";


type Props = {
  chatId: string,
  messages: Message[],
  onDeleteCallback: (message: Message) => any
}

const fixId = (id: string) => id.split('/')[2];

export const ChatMessagesList: FC<Props> = ({ chatId, messages, onDeleteCallback }) => {

  const { user } = useContext(AuthContext);

  const chatService = useChatService();
  const notificationService = useNotificationService();
  
  const userFriendsMap = useUserFriendsMap();
  const userFriendNamesMap = useUserFriendNamesMap();

  const deleteMessageMutator = useMutation(({ messageId, mode }: any) => chatService.deleteMessage(chatId, messageId, mode), {
    onSuccess: (message: Message) => {
      notificationService.success("You have succesfully deleted message.");
      onDeleteCallback(message);
    },
    onError: (error: AxiosError) => {
      notificationService.error(extractErrorMessage(error.response?.data));
    }
  });
  const deleteMessage = (deleteMessage: any) => deleteMessageMutator.mutate(deleteMessage);


  return (
    <>
      {
        messages?.map((message: Message) => {
          return (
          <div key={message.ID} style={{width: '98%', marginBottom: '15px'}}>
            <div style={{display: 'flex'}}>
              <img src={userFriendsMap[message.FromId]?.Image || user?.Image} width='36px' height='36px' style={{marginRight: '10px'}} />
              <p style={{marginTop: '8px'}}>{userFriendNamesMap[message.FromId] || 'You'} @ {moment(message.CreatedAt).format('yyyy-MM-DD HH:mm')}: {message.Message}</p>
            </div>
            <div style={{float: 'right', marginTop: '-2.65em'}}>
              <DropdownMenu>
                <DropdownItem title="Delete for Me" onClick={() => deleteMessage({ messageId: fixId(message.ID), mode: 'for_me' })}></DropdownItem>
                <DropdownItem title="Delete for Both" onClick={() => deleteMessage({ messageId: fixId(message.ID), mode: 'for_both' })}></DropdownItem>
              </DropdownMenu>
            </div>
          </div>
          );
        })
      }
    </>
  );
}