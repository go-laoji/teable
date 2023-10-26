import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Database, MoreHorizontal } from '@teable-group/icons';
import type { IGetBaseVo } from '@teable-group/openapi';
import { deleteBase, updateBase } from '@teable-group/openapi';
import { Button, Card, CardContent, Input } from '@teable-group/ui-lib/shadcn';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import { useState, type FC, useRef } from 'react';
import { EmojiPicker } from '../../components/EmojiPicker';
import { BaseActionTrigger } from './component/BaseActionTrigger';

interface IBaseCard {
  base: IGetBaseVo;
  className?: string;
}

export const BaseCard: FC<IBaseCard> = (props) => {
  const { base, className } = props;
  const router = useRouter();
  const queryClient = useQueryClient();
  const routerSpaceId = router.query.spaceId;
  const [renaming, setRenaming] = useState<boolean>();
  const inputRef = useRef<HTMLInputElement>(null);
  const [baseName, setBaseName] = useState<string>(base.name);

  const { mutateAsync: updateBaseMutator } = useMutation({
    mutationFn: updateBase,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: routerSpaceId ? ['base-list', routerSpaceId] : ['base-list'],
      });
    },
  });

  const { mutate: deleteBaseMutator } = useMutation({
    mutationFn: deleteBase,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: routerSpaceId ? ['base-list', routerSpaceId] : ['base-list'],
      });
    },
  });

  const toggleRenameBase = async (e: React.FocusEvent<HTMLInputElement, Element>) => {
    const name = e.target.value;
    if (!name || name === base.name) {
      setRenaming(false);
      return;
    }
    await updateBaseMutator({
      baseId: base.id,
      updateBaseRo: { name },
    });
    setRenaming(false);
  };

  const onRename = () => {
    setRenaming(true);
    setTimeout(() => inputRef.current?.focus(), 200);
  };

  const clickStopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const intoBase = () => {
    router.push({
      pathname: '/base/[baseId]',
      query: {
        baseId: base.id,
      },
    });
  };

  const iconChange = (icon: string) => {
    updateBaseMutator({
      baseId: base.id,
      updateBaseRo: { icon },
    });
  };

  return (
    <Card
      className={classNames('group cursor-pointer hover:shadow-md', className)}
      onClick={intoBase}
    >
      <CardContent className="flex h-full w-full items-center px-4 py-6">
        {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */}
        <div onClick={(e) => e.stopPropagation()}>
          <EmojiPicker onChange={iconChange}>
            {base.icon ? (
              <span className="h-14 w-14 min-w-[3.5rem] text-[3.5rem] leading-none">
                {base.icon}
              </span>
            ) : (
              <Database className="h-14 w-14 min-w-[3.5rem]" />
            )}
          </EmojiPicker>
        </div>
        <div className="h-full flex-1 overflow-hidden">
          <div className="flex items-center justify-between gap-3 p-0.5">
            {renaming ? (
              <Input
                ref={inputRef}
                className="h-7 flex-1"
                value={baseName}
                onChange={(e) => setBaseName(e.target.value)}
                onBlur={toggleRenameBase}
                onClick={clickStopPropagation}
              />
            ) : (
              <h3 className="line-clamp-2 flex-1 px-4	" title={base.name}>
                {base.name}
              </h3>
            )}
            <div className="shrink-0">
              <BaseActionTrigger onDelete={() => deleteBaseMutator(base.id)} onRename={onRename}>
                <Button className="opacity-0 group-hover:opacity-100" variant={'ghost'} size={'sm'}>
                  <MoreHorizontal />
                </Button>
              </BaseActionTrigger>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
