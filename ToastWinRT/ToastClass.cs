using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Windows.UI.Notifications;
using Windows.Data.Xml.Dom;
using Windows.Media.Capture;
using Windows.Storage;
using Windows.Storage.AccessCache;
using Windows.Storage.Streams;
using Windows.Foundation;


namespace ToastWinRT
{
    [Windows.Foundation.Metadata.AllowForWeb]
    public sealed class ToastClass
    {
        public async void toastMessage(String message, int delay)
        {
            ToastTemplateType toastTemplate = ToastTemplateType.ToastImageAndText01;
            XmlDocument toastXml = ToastNotificationManager.GetTemplateContent(toastTemplate);

            XmlNodeList toastTextElements = toastXml.GetElementsByTagName("text");
            toastTextElements[0].AppendChild(toastXml.CreateTextNode(message));

            XmlNodeList toastImageAttributes = toastXml.GetElementsByTagName("image");
            ((XmlElement)toastImageAttributes[0]).SetAttribute("src", "https://raw.githubusercontent.com/seksenov/grouppost/master/images/logo.png");
            ((XmlElement)toastImageAttributes[0]).SetAttribute("alt", "red graphic");

            IXmlNode toastNode = toastXml.SelectSingleNode("/toast");
            ((XmlElement)toastNode).SetAttribute("duration", "short");

            XmlElement audio = toastXml.CreateElement("audio");
            audio.SetAttribute("src", "ms-winsoundevent:Notification.IM");
            toastNode.AppendChild(audio);

            ((XmlElement)toastNode).SetAttribute("launch", "{\"type\":\"toast\",\"param1\":\"12345\",\"param2\":\"67890\"}");

            ToastNotification toast = new ToastNotification(toastXml);

            await Task.Delay(delay);
            ToastNotificationManager.CreateToastNotifier().Show(toast);
        }

        //Simple test function to try calling the WinRT component
        public int getValue()
        {
            return 5;
        }
    }
}
