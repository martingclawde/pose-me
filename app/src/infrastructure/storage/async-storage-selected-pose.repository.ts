import AsyncStorage from '@react-native-async-storage/async-storage';

import type { SelectedPoseRepository } from '../../application/ports/selected-pose-repository';

const SELECTED_POSE_CARD_ID_KEY = 'selected_pose_card_id';

export class AsyncStorageSelectedPoseRepository implements SelectedPoseRepository {
  async saveSelectedPoseCardId(poseCardId: string): Promise<void> {
    await AsyncStorage.setItem(SELECTED_POSE_CARD_ID_KEY, poseCardId);
  }

  async getSelectedPoseCardId(): Promise<string | null> {
    return AsyncStorage.getItem(SELECTED_POSE_CARD_ID_KEY);
  }
}
