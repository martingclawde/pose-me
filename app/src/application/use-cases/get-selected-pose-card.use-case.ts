import type { SelectedPoseRepository } from '../ports/selected-pose-repository';

export class GetSelectedPoseCardUseCase {
  constructor(private readonly selectedPoseRepository: SelectedPoseRepository) {}

  async execute(): Promise<string | null> {
    return this.selectedPoseRepository.getSelectedPoseCardId();
  }
}
