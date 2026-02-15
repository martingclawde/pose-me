import type { SelectedPoseRepository } from '../ports/selected-pose-repository';

interface SelectPoseCardCommand {
  poseCardId: string;
}

export class SelectPoseCardUseCase {
  constructor(private readonly selectedPoseRepository: SelectedPoseRepository) {}

  async execute(command: SelectPoseCardCommand): Promise<void> {
    const trimmedPoseCardId = command.poseCardId.trim();

    if (!trimmedPoseCardId) {
      throw new Error('Pose card id is required');
    }

    await this.selectedPoseRepository.saveSelectedPoseCardId(trimmedPoseCardId);
  }
}
