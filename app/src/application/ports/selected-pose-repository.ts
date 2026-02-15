export interface SelectedPoseRepository {
  saveSelectedPoseCardId(poseCardId: string): Promise<void>;
  getSelectedPoseCardId(): Promise<string | null>;
}
