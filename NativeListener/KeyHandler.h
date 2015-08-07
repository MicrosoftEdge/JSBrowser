#pragma once

namespace NativeListener
{
	public delegate void NotifyAppHandler(int keyComb);

	[Windows::Foundation::Metadata::AllowForWebAttribute]
	public ref class KeyHandler sealed
    {
    public:
        KeyHandler();

		event NotifyAppHandler^ NotifyAppEvent;
		void setKeyCombination(int keyPress);
	private:
		Windows::UI::Core::CoreDispatcher^ m_dispatcher;
    };
}
