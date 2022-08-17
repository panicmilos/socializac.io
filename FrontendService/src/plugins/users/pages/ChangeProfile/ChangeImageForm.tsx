import { FC, useState } from "react";
import { useMutation } from "react-query";
import { Button, Image, useImageService, useNotificationService, IMAGES_SERVICE_URL } from "../../imports";
import { Profile } from "../../models/User";
import { useUserService } from "../../services";

type Props = {
  user?: Profile;
}

export const ChangeImageForm: FC<Props> = ({ user }) => {

  const [localImageUrl, setLocalImageUrl] = useState(user?.Image || '');
  const [image, setImage] = useState<any>();

  const onImageChange = (event: any) => {
    if (event.target.files && event.target.files[0]) {
      const image = event.target.files[0];

      setLocalImageUrl(URL.createObjectURL(image));

      var reader = new FileReader();
      reader.onload = function() {
        var imageBuffer: string = this.result as string || ',;';
        
        const ext = (imageBuffer.split(';') as any)[0].replace('data:image/', '');
        const data = (imageBuffer.split(',') as any)[1];

        setImage({ ext, data });
      }
      reader.readAsDataURL(image);
    }
  }

  const imageService = useImageService();
  const userService = useUserService();
  const notificationService = useNotificationService();

  const uploadImageMutator = useMutation([imageService], () => imageService.upload(image), {
    onSuccess: (image: Image) => {
      setLocalImageUrl(`${IMAGES_SERVICE_URL}/images/${image.name}.${image.extension}`);
      saveProfile();
    },
    onError: (e) => {
      notificationService.error("Unable to upload the picture.");
    }
  })
  const uploadImage = () => uploadImageMutator.mutate();

  const saveProfileMutator = useMutation([userService], () => userService.changeImage(user?.ID ?? '', localImageUrl), {
    onSuccess: (_) => {
      notificationService.error("You have successfully changed the profile image.");
    },
    onError: (_) => {
      notificationService.error("Unable to change the picture.");
    }
  })
  const saveProfile = () => saveProfileMutator.mutate();

  const saveImage = () => {
    if (localImageUrl) {
      uploadImage();
      return;
    }
    
    saveProfile();
  }


  const clearImage = () => {
    setLocalImageUrl('');
    setImage(undefined);
  }

  return (
    <>
      <div>
        <img src={localImageUrl} alt="Profile" />

        <h1>Select Image</h1>
        <input
          type="file"
          accept=".png, .jpg, .jpeg" 
          onChange={onImageChange}
        />
      </div>

      <Button onClick={saveImage} type="button">Save</Button>
      <Button onClick={clearImage} type="button">Clear</Button>
    </>
  );
}