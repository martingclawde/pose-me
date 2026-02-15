import type { SelectedPoseRepository } from '../../../../src/application/ports/selected-pose-repository';
import { SelectPoseCardUseCase } from '../../../../src/application/use-cases/select-pose-card.use-case';

class InMemorySelectedPoseRepository implements SelectedPoseRepository {
  private selectedPoseCardId: string | null = null;

  async saveSelectedPoseCardId(poseCardId: string): Promise<void> {
    this.selectedPoseCardId = poseCardId;
  }

  async getSelectedPoseCardId(): Promise<string | null> {
    return this.selectedPoseCardId;
  }
}

describe('SelectPoseCardUseCase', () => {
  it('stores the selected pose card id', async () => {
    const repository = new InMemorySelectedPoseRepository();
    const useCase = new SelectPoseCardUseCase(repository);

    await useCase.execute({ poseCardId: 'pose_001' });

    await expect(repository.getSelectedPoseCardId()).resolves.toBe('pose_001');
  });

  it('rejects empty pose card id', async () => {
    const repository = new InMemorySelectedPoseRepository();
    const useCase = new SelectPoseCardUseCase(repository);

    await expect(useCase.execute({ poseCardId: '' })).rejects.toThrow(
      'Pose card id is required',
    );
  });
});
